// ============================================================
// Wirasat (WillMaker) Configuration
// ============================================================

const BOT_CONFIG = {

  // Basic Info
  projectName: "WillMaker",
  projectTagline: "Government-Grade Digital Will System",
  
  // About the project
  about: `
    WillMaker is a full-stack civic-tech platform for end-to-end digital will creation, witness signing, registrar approval, and lifecycle case tracking.
    Problem: Over 70% of Indian families face legal disputes after a member's passing due to the absence of a legally structured and verifiable will. Current systems are inaccessible, complex, and paper-only.
    Vision: WillMaker is a government-ready digital infrastructure where every will becomes a trackable legal case — think GST Portal meets DigiLocker meets Legal Will. Citizens create wills easily, authorities verify digitally, and families access transparently.
    Users Roles: Citizen (Creates will), Witness (Reviews and Signs), Registrar (Reviews submissions & Approves/Rejects), Beneficiary (Views & tracks execution post-death).
    System Mental Model: The entire system revolves around one central entity: the Will Case (caseId: WILL-XXXX). Contains Owner, Document, Witnesses, Registrar, Beneficiaries, and Timeline.
  `,

  // Features your project has
  features: [
    "Guided Will Builder: Multi-step form with plain language questions. 5 steps: Personal Info -> Family -> Assets -> Distribution -> Special Wishes. Validates before proceeding. Outputs structured JSON.",
    "Legal PDF Generator: Converts JSON into a formatted legal document with Testator Details, Beneficiaries, Asset Allocation, Witness Section using @react-pdf/renderer or jsPDF.",
    "Witness E-Sign Flow: User invites 2+ witnesses via unique token link. Witness reviews document and signs via HTML5 canvas. OTP confirmation. Signature stored as base64.",
    "SHA-256 Hash (Tamper-Proof): PDF -> SHA-256 hash generated client-side via crypto-js. Hash stored separately before upload. Verified on every document access. Mismatch = tampered flag.",
    "Case Timeline (Core Feature): Lifecycle audit log (append-only).",
    "Registrar Approval: Pending case queue for Registrar. Reviews document + witness signatures. Actions: Approve or Reject (with reason). Output: Registration ID + approval timestamp.",
    "Secure Vault: Firebase Storage with server-side encryption. Role-based Firestore security rules. Controlled access per phase gate."
  ],

  // How users can use your project
  howToUse: `
    The system follows a 10-Step Workflow:
    1. Citizen fills guided 5-step form
    2. Structured JSON generated from form data
    3. Legal PDF auto-generated from JSON
    4. SHA-256 hash created from PDF (tamper-proof)
    5. Witness invite links sent (unique token per witness)
    6. Witnesses sign digitally via canvas + OTP
    7. Case submitted to Registrar queue
    8. Registrar approves -> Registration ID issued
    9. Timeline updated in real-time at every step
    10. Encrypted vault stores PDF + hash + signatures
  `,

  // Common questions and answers
  faqs: [
    {
      q: "What is the Tech Stack?",
      a: "Stack: React + Vite + Tailwind, Firebase, Ollama (local AI)."
    },
    {
      q: "What are the User Roles?",
      a: "Citizen, Witness, Registrar, and Beneficiary. Role routing is enforced via Firebase Auth custom claims."
    },
    {
      q: "How does the system ensure security and tamper-proofing?",
      a: "It uses a SHA-256 hash generated client-side for the PDF. It is verified on every document access, and any mismatch will flag it as tampered."
    }
  ],

  // Team / Contact
  teamName: "Antigravity",
  contactEmail: "support@willmaker.gov",
  websiteURL: "https://willmaker.gov",

  // Bot personality
  botName: "Wirasat",
  botTone: "empathetic, knowledgeable about WillMaker, professional, and entirely focused on helping users with WillMaker. IMPORTANT: Keep your responses concise and precise, but provide enough detail to fully answer the question securely without being overly brief.",

};

module.exports = BOT_CONFIG;
