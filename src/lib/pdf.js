import { jsPDF } from "jspdf";
import CryptoJS from "crypto-js";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, setDoc } from "firebase/firestore";

/**
 * Validates a Will Document JSON
 */
export const validateWillJson = (willData) => {
  if (!willData || !willData.testator || !willData.testator.name) {
    throw new Error("Invalid Will JSON: Testator name is missing.");
  }
  return true;
};

/**
 * Generates a standard legal-looking Will document using jsPDF
 */
export const generateWillPDF = (willData) => {
  const doc = new jsPDF();
  const { testator, family, assets, beneficiaries, specialWishes } = willData;

  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("LAST WILL AND TESTAMENT", 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`I, ${testator.name}, residing at ${testator.address}, being of sound mind, do hereby make, publish and declare this to be my Last Will and Testament.`, 20, 40, { maxWidth: 170 });

  doc.text("1. REVOCATION OF PRIOR WILLS", 20, 60);
  doc.setFontSize(11);
  doc.text("I revoke all prior wills and codicils made by me.", 20, 68);

  doc.setFontSize(12);
  doc.text("2. FAMILY INFORMATION", 20, 80);
  doc.setFontSize(11);
  let y = 88;
  if (family.spouseName) {
    doc.text(`I am married to ${family.spouseName}.`, 20, y);
    y += 8;
  }
  if (family.children && family.children.length > 0) {
    doc.text(`My children are: ${family.children.join(", ")}.`, 20, y);
    y += 8;
  }

  doc.setFontSize(12);
  doc.text("3. ASSETS & DISTRIBUTION", 20, y+10);
  doc.setFontSize(11);
  doc.text("My assets are defined as follows:", 20, y+18);
  y += 26;
  
  if (assets && assets.length > 0) {
    assets.forEach((asset, idx) => {
      doc.text(`- ${asset}`, 25, y);
      y += 8;
    });
  }

  doc.text("I wish to distribute my estate as follows:", 20, y + 5);
  y += 13;
  if (beneficiaries && beneficiaries.length > 0) {
    beneficiaries.forEach((b, idx) => {
      doc.text(`- ${b}`, 25, y);
      y += 8;
    });
  }

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.text("4. SPECIAL WISHES", 20, y+10);
  doc.setFontSize(11);
  if (specialWishes.funeralInstructions) {
    doc.text(`Funeral Instructions: ${specialWishes.funeralInstructions}`, 20, y+18, { maxWidth: 170 });
    y += 18; // approx 2 lines
  }
  if (specialWishes.guardianForMinors) {
    y += 8;
    doc.text(`Guardian for Minors: ${specialWishes.guardianForMinors}`, 20, y);
  }
  if (specialWishes.charity) {
    y += 8;
    doc.text(`Charitable Donations: ${specialWishes.charity}`, 20, y);
  }

  // Adding space for signatures
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  y += 20;
  doc.text("IN WITNESS WHEREOF, I have hereunto set my hand on this ____ day of ______________, 20__.", 20, y, { maxWidth: 170 });
  y += 25;
  doc.line(20, y, 90, y);
  doc.text("Testator Signature", 20, y + 6);
  
  y += 30;
  doc.text("We, the witnesses, sign below confirming the testator signed this voluntarily in our presence.", 20, y, { maxWidth: 170 });
  y += 25;
  doc.line(20, y, 90, y);
  doc.text("Witness 1 Signature", 20, y + 6);
  doc.line(110, y, 180, y);
  doc.text("Witness 2 Signature", 110, y + 6);

  // Instead of saving to disk, return it as ArrayBuffer to hash and upload
  const pdfOutput = doc.output('arraybuffer');
  return pdfOutput;
};

/**
 * Creates SHA-256 hash from ArrayBuffer
 */
export const hashDocument = (arrayBuffer) => {
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
  return hash;
};

/**
 * Complete Flow: Generates PDF, hashes it, uploads it, and saves Case to Firestore
 */
export const processWillDocument = async (willData) => {
  try {
    validateWillJson(willData);
    
    // 1. Generate PDF
    const pdfBuffer = generateWillPDF(willData);
    
    // 2. Hash Document
    const fileHash = hashDocument(pdfBuffer);
    
    // 3. Upload to Storage
    const storageRef = ref(storage, `wills/${willData.caseId}.pdf`);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const snapshot = await uploadBytes(storageRef, blob, { customMetadata: { hash: fileHash } });
    
    const downloadURL = await getDownloadURL(storageRef);
    
    // 4. Update WillData with Document info
    willData.document = {
      pdfUrl: downloadURL,
      hash: fileHash,
      generatedAt: new Date().toISOString()
    };
    willData.status = "witness_pending"; // Move to next phase

    // 5. Save to Firestore
    const caseRef = doc(db, 'cases', willData.caseId);
    await setDoc(caseRef, willData);
    
    return willData;
  } catch (error) {
    console.error("Error processing will document:", error);
    throw error;
  }
};
