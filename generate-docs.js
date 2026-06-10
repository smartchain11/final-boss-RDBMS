const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, Header, PageNumber,
  PageBreak, BorderStyle, ShadingType, ImageRun
} = require('docx');

const FONT = 'Bookman Old Style';
const FS = 24;
const AUTHOR = 'Jun Dave Moreno';
const EMAIL = 'jmoreno58@asscat.edu.ph';
const INSTRUCTOR = 'BERNIE S. BALIGHOT';
const INSTRUCTOR_RANK = 'ASSOCIATE PROFESSOR I';
const UNIVERSITY = 'Agusan del Sur State University';
const COLLEGE = 'College of Computing and Information Sciences';
const SUBJECT_CODE = 'ITCC 104';
const SUBJECT_DESC = 'Database Management System';
const PROJECT_TITLE = 'Necry OER Portal: A Decoupled Open Educational Resources Digital Marketplace';
const COURSE_YEAR_SECTION = 'Bachelor of Science in Information Technology - III-A';
const DATE_SUBMISSION = 'June 2026';

const THIN_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
};

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

const DIAGRAM_DIR = path.join(__dirname, 'diagrams');

function embedDiagram(fileName, caption, width = 600) {
  const filePath = path.join(DIAGRAM_DIR, fileName);
  let imgBuffer;
  try { imgBuffer = fs.readFileSync(filePath); } catch (e) {
    return [new Paragraph({ children: [new TextRun({ text: `[Diagram not found: ${fileName}]`, font: FONT, size: FS, color: 'CC0000' })], alignment: AlignmentType.CENTER })];
  }
  // Calculate height preserving aspect ratio (PNG default 72 DPI)
  const { imageSize } = require('image-size');
  const img = imageSize(imgBuffer);
  const ratio = img.height / img.width;
  const height = Math.round(width * ratio);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 }, children: [
      new ImageRun({ data: imgBuffer, transformation: { width, height }, type: 'png' }),
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
      new TextRun({ text: caption, font: FONT, size: 20, italics: true, color: '444444' }),
    ]}),
  ];
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FS, bold: true })],
    spacing: { before: 360, after: 200 },
    alignment: AlignmentType.LEFT,
  });
}
function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FS, bold: true })],
    spacing: { before: 280, after: 160 },
    alignment: AlignmentType.LEFT,
  });
}
function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FS, bold: true })],
    spacing: { before: 200, after: 120 },
    alignment: AlignmentType.LEFT,
  });
}

function para(text, opts = {}) {
  const runs = [];
  if (typeof text === 'string') {
    runs.push(new TextRun({ text, font: FONT, size: FS, bold: opts.bold || false }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === 'string') runs.push(new TextRun({ text: t, font: FONT, size: FS }));
      else runs.push(new TextRun({ font: FONT, size: FS, ...t }));
    });
  }
  return new Paragraph({
    children: runs,
    spacing: { after: 120, line: 360 },
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { firstLine: 720 } : undefined,
  });
}

function boldPara(text) {
  return para(text, { bold: true });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FS })],
    spacing: { after: 60 },
    bullet: { level },
    alignment: AlignmentType.LEFT,
  });
}

function numberedItem(num, text) {
  return new Paragraph({
    children: [new TextRun({ text: `${num}. ${text}`, font: FONT, size: FS })],
    spacing: { after: 60 },
    alignment: AlignmentType.LEFT,
  });
}

function sp() {
  return new Paragraph({ spacing: { after: 0 }, children: [] });
}

function centeredPara(text, bold = false, size = FS) {
  const runs = typeof text === 'string'
    ? [new TextRun({ text, font: FONT, size, bold })]
    : text.map(t => new TextRun({ font: FONT, size, ...t }));
  return new Paragraph({
    children: runs,
    alignment: AlignmentType.CENTER,
    spacing: { after: 80, line: 360 },
  });
}

function sectionBreak() {
  return new Paragraph({
    children: [new TextRun({ text: '', font: FONT, size: FS })],
    spacing: { after: 0 },
    pageBreakBefore: true,
  });
}

function pageNumberHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: FS })],
      }),
    ],
  });
}

function emptyHeader() {
  return new Header({ children: [new Paragraph({ children: [] })] });
}

// ============================================================
// SCREENSHOT PLACEHOLDER BOX
// ============================================================
function screenshotBox(label, description) {
  const content = [
    new Paragraph({
      children: [new TextRun({ text: '📷 SCREENSHOT PLACEHOLDER', font: FONT, size: 22, bold: true, color: 'CC0000' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: label, font: FONT, size: 22, bold: true, color: '333333' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: description, font: FONT, size: 20, color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
  ];

  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: content,
            shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
            borders: {
              top: { style: BorderStyle.DASHED, size: 2, color: 'CC0000' },
              bottom: { style: BorderStyle.DASHED, size: 2, color: 'CC0000' },
              left: { style: BorderStyle.DASHED, size: 2, color: 'CC0000' },
              right: { style: BorderStyle.DASHED, size: 2, color: 'CC0000' },
            },
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ============================================================
// CODE BOX
// ============================================================
function codeBox(code) {
  const lines = code.split('\n').filter(l => l.trim() !== '');
  const codeParas = lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, font: 'Courier New', size: 18, color: '1a1a1a' })],
      spacing: { after: 0, before: 0, line: 276 },
      alignment: AlignmentType.LEFT,
    })
  );

  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: codeParas,
            shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              left: { style: BorderStyle.SINGLE, size: 4, color: '4472C4' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            },
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ============================================================
// USE CASE TABLE (upgraded)
// ============================================================
function ucTable(rows) {
  const headers = ['Use Case Name', 'Actor', 'Description', 'Preconditions', 'Main Flow', 'Alternative Flow', 'Postconditions'];
  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: h, font: FONT, size: 18, bold: true, color: 'FFFFFF' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
        })],
        shading: { type: ShadingType.CLEAR, fill: '4472C4' },
        borders: THIN_BORDER,
      })
    ),
  });

  const dataRows = rows.map((r, idx) => {
    const vals = [r.name, r.actor, r.description, r.preconditions, r.mainFlow, r.altFlow, r.postconditions];
    const bgColor = idx % 2 === 0 ? 'FFFFFF' : 'F2F7FB';
    return new TableRow({
      children: vals.map(v =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: v, font: FONT, size: 16 })],
            spacing: { after: 40 },
          })],
          shading: { type: ShadingType.CLEAR, fill: bgColor },
          borders: THIN_BORDER,
        })
      ),
    });
  });

  return new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

// ============================================================
// DATA DICTIONARY TABLE (upgraded)
// ============================================================
function dataDictTable(rows) {
  const headers = ['Field Name', 'Data Type', 'Length', 'Constraints', 'Description'];
  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: h, font: FONT, size: 18, bold: true, color: 'FFFFFF' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
        })],
        shading: { type: ShadingType.CLEAR, fill: '2E75B6' },
        borders: THIN_BORDER,
      })
    ),
  });

  const dataRows = rows.map((r, idx) => {
    const vals = [r.field, r.type, r.length, r.constraints, r.description];
    const bgColor = idx % 2 === 0 ? 'FFFFFF' : 'EBF1F8';
    return new TableRow({
      children: vals.map(v =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: v, font: FONT, size: 16 })],
            spacing: { after: 20 },
          })],
          shading: { type: ShadingType.CLEAR, fill: bgColor },
          borders: THIN_BORDER,
        })
      ),
    });
  });

  return new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

// ============================================================
// CRUD MATRIX TABLE
// ============================================================
function crudTable(rows) {
  const headers = ['Entity', 'Create', 'Read', 'Update', 'Delete'];
  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: h, font: FONT, size: 18, bold: true, color: 'FFFFFF' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
        })],
        shading: { type: ShadingType.CLEAR, fill: '548235' },
        borders: THIN_BORDER,
      })
    ),
  });

  const dataRows = rows.map((row, idx) => {
    const bg = idx % 2 === 0 ? 'FFFFFF' : 'F0F5EB';
    return new TableRow({
      children: row.map(cell =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: cell, font: FONT, size: 16 })],
            spacing: { after: 20 },
          })],
          shading: { type: ShadingType.CLEAR, fill: bg },
          borders: THIN_BORDER,
        })
      ),
    });
  });

  return new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

// ============================================================
// CHAPTER SECTION BUILDER
// ============================================================
function createChapterSection(titlePageChildren, contentChildren) {
  return {
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1728 },
      },
      titlePage: true,
    },
    headers: { default: pageNumberHeader(), first: emptyHeader() },
    children: [...titlePageChildren, ...contentChildren],
  };
}

// =====================================================================
// CONTENT ASSEMBLY
// =====================================================================

// ---- COVER PAGE ----
const coverPage = [
  sp(), sp(), sp(), sp(),
  centeredPara(UNIVERSITY, true, 32),
  centeredPara(COLLEGE, true, 26),
  sp(), sp(),
  // Decorative line
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: '════════════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  centeredPara(PROJECT_TITLE, true, 26),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [new TextRun({ text: '════════════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  centeredPara(`${SUBJECT_CODE} \u2013 ${SUBJECT_DESC}`, false, 24),
  sp(), sp(),
  centeredPara(`Date of Submission: ${DATE_SUBMISSION}`, false, 24),
  sp(), sp(),
  centeredPara(`Instructor: ${INSTRUCTOR}`, false, 24),
  centeredPara(INSTRUCTOR_RANK, true, 24),
  sp(), sp(),
  centeredPara('Submitted by:', false, 24),
  centeredPara(AUTHOR, true, 26),
  centeredPara(COURSE_YEAR_SECTION, false, 24),
  centeredPara(EMAIL, false, 22),
];

// ---- TABLE OF CONTENTS ----
const tocEntries = [
  { text: 'Chapter 1 \u2013 System Overview', bold: true },
  { text: '      A. System Overview', bold: false },
  { text: '      B. Target Users of the System', bold: false },
  { text: '      C. Scope of the System', bold: false },
  { text: '      D. Technology Stack', bold: false },
  { text: 'Chapter 2 \u2013 System Architecture', bold: true },
  { text: '      A. System Architecture Diagram', bold: false },
  { text: '      B. Discussion', bold: false },
  { text: 'Chapter 3 \u2013 Unified Modeling Language (UML)', bold: true },
  { text: '      A. Introduction to UML', bold: false },
  { text: '      B. Use Case Diagram', bold: false },
  { text: '      C. Use Case Descriptions', bold: false },
  { text: 'Chapter 4 \u2013 Sequence Diagrams', bold: true },
  { text: '      A. Sequence Diagrams and Discussion', bold: false },
  { text: 'Chapter 5 \u2013 Database Design', bold: true },
  { text: '      A. Entity Relationship Diagram (ERD)', bold: false },
  { text: '      B. Overview of Entities', bold: false },
  { text: '      C. Database Schema (Data Dictionary)', bold: false },
  { text: '      D. Relationship Description', bold: false },
  { text: 'Chapter 6 \u2013 SQL Implementation of CRUD Operations', bold: true },
  { text: '      A. Data Entry (CREATE)', bold: false },
  { text: '      B. Data Views (READ)', bold: false },
  { text: '      C. Data Manipulation (UPDATE)', bold: false },
  { text: '      D. Search and Delete Records (DELETE)', bold: false },
];

const tocSection = [
  sp(), sp(), sp(),
  centeredPara('TABLE OF CONTENTS', true, 28),
  sp(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: '────────────────────────────────────', font: FONT, size: 24, color: '4472C4' })],
  }),
  ...tocEntries.map(e =>
    new Paragraph({
      children: [new TextRun({ text: e.text, font: FONT, size: FS, bold: e.bold })],
      spacing: { after: 80 },
      alignment: AlignmentType.LEFT,
    })
  ),
];

// ---- CHAPTER 1 ----
const ch1Title = [
  sp(), sp(), sp(),
  centeredPara('CHAPTER 1', true, 30),
  centeredPara('SYSTEM OVERVIEW', true, 30),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: '═════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  sectionBreak(),
];
const ch1Content = [
  h2('A. System Overview'),
  boldPara('System Name: Necry OER Portal (NECRYOER)'),
  para('NECRYOER is a decoupled digital marketplace designed to revolutionize the accessibility of Open Educational Resources (OER) within the academic community. Built on a modern three-tier architecture, it provides a secure environment where educators can contribute, share, and monetize their academic work, while learners can access high-quality curated content efficiently. The system implements role-based access control with four distinct user roles: Administrator, Uploader, Student, and Guest.', { indent: true }),
  para('Purpose of the System: The system addresses the critical need for a localized, relational database-driven platform that supports both open access and academic monetization. It ensures intellectual property protection through secure streaming and access logging while fostering a community of knowledge exchange. Key objectives include: (1) providing a centralized repository for digital educational materials, (2) enabling uploaders to monetize their content through a revenue-sharing model, (3) implementing subscription and promo discount systems to make content affordable, and (4) ensuring secure authentication with email verification and device tracking.', { indent: true }),

  h2('B. Target Users of the System'),
  boldPara('1. Administrator'),
  para('The system administrator has full access to user management, content moderation, withdrawal processing, and system configuration. Administrators can approve or reject uploaded resources, manage user accounts (verify, suspend, reset passwords), process withdrawal requests, and oversee the entire platform ecosystem.', { indent: true }),
  boldPara('2. Uploader / Author'),
  para('Uploaders are educators or content creators who contribute learning materials to the platform. They can upload books and resources with metadata (title, author, ISBN, edition, publisher, etc.), set prices, track real-time sales and earnings, manage their own content library, set up payout accounts (GCash, Maya, Bank), and request withdrawals of their accumulated earnings.', { indent: true }),
  boldPara('3. Student / Regular User'),
  para('Students and regular users can browse the digital library by subject/department, search for specific titles, preview materials (free preview up to configured percentage), purchase resources with applicable discounts (promo or subscription-based), access purchased materials through secure streaming, upgrade subscription tiers (Pro or Pro+), and track their purchase history and transactions.', { indent: true }),
  boldPara('4. Guest User'),
  para('Guest users can browse the public catalog, view resource details and metadata, and search available materials. However, they must register and verify their email to access full content, make purchases, or upload materials.', { indent: true }),

  h2('C. Scope of the System'),
  boldPara('Administrator Privileges'),
  bullet('Full user management: view, verify, suspend, and manage all users'),
  bullet('Content moderation: approve or reject uploaded resources and books'),
  bullet('User verification: process student verification with proof documents'),
  bullet('Password management: reset user passwords when needed'),
  bullet('Department and course management: add, update, and delete academic departments and courses'),
  bullet('Section management: organize course content into sections'),
  bullet('Withdrawal processing: review and process uploader payout requests'),
  boldPara('Uploader / Author Privileges'),
  bullet('Upload and manage digital books and resources with full metadata'),
  bullet('Set pricing and configure preview percentages for their materials'),
  bullet('View real-time earnings dashboard with transaction history'),
  bullet('Set up and manage multiple payout accounts (up to 3 per type: GCash, Maya, Bank)'),
  bullet('Set a 6-digit payout PIN for withdrawal security'),
  bullet('Request withdrawals of accumulated earnings'),
  bullet('Edit and delete their own uploaded materials'),
  bullet('Access their own materials for free without purchase or open limits'),
  boldPara('Student / Regular User Privileges'),
  bullet('Browse the full digital library catalog by department, course, or search query'),
  bullet('View detailed resource information including preview samples'),
  bullet('Register and verify email through OTP-based verification'),
  bullet('Purchase resources with automatic best-discount computation'),
  bullet('Access purchased resources through secure in-app reading'),
  bullet('Upgrade subscription tier (Pro: 10% discount, Pro+: 25% discount)'),
  bullet('View purchase history and transaction records'),
  bullet('Track account activity and manage trusted devices'),
  boldPara('Guest User Privileges'),
  bullet('Browse public catalog and search for resources'),
  bullet('View resource metadata, descriptions, and preview information'),

  h2('D. Technology Stack'),
  boldPara('Front-End Technologies'),
  para('React 18 \u2013 A modern JavaScript library for building user interfaces. Used to create a dynamic single-page application (SPA) with component-based architecture, state management via React hooks (useState, useEffect, useContext), and client-side routing.', { indent: true }),
  para('Tailwind CSS \u2013 A utility-first CSS framework that enables rapid UI development through pre-built utility classes. Provides responsive design, consistent styling, and rapid prototyping without leaving the HTML.', { indent: true }),
  para('JavaScript (ES6+) \u2013 Modern JavaScript with async/await patterns for asynchronous API calls, Promises for request handling, and template literals for dynamic content generation.', { indent: true }),
  para('Axios \u2013 HTTP client for making API requests from the frontend to the backend with automatic JSON parsing, request/response interceptors, and token-based authentication headers.', { indent: true }),

  boldPara('Back-End Technologies'),
  para('PHP 8.2 \u2013 The server-side scripting language powering the application logic. Provides robust type safety, JIT compilation for improved performance, and comprehensive error handling.', { indent: true }),
  para('CodeIgniter 4 \u2013 A lightweight PHP MVC framework that provides structured application architecture, built-in database abstraction layer (Query Builder), request routing, middleware support (Filters), and RESTful API development capabilities.', { indent: true }),
  para('JWT (JSON Web Tokens) via firebase/php-jwt \u2013 Implements token-based authentication where users receive a signed JWT upon login, which is then verified on every subsequent API request to maintain session state.', { indent: true }),

  boldPara('Database Technologies'),
  para('MariaDB / MySQL \u2013 Relational database management system using InnoDB engine with utf8mb4 charset. Provides ACID-compliant transactions, foreign key constraints for referential integrity, and optimized query performance through proper indexing strategies.', { indent: true }),

  boldPara('Additional Technologies'),
  bullet('PHPMailer \u2013 SMTP-based email delivery for verification codes, password reset links, purchase receipts, and device alerts via Gmail TLS 587'),
  bullet('ip-api.com \u2013 IP geolocation service for tracking user login locations and detecting unrecognized devices'),
  bullet('Git \u2013 Version control for source code management'),
  bullet('Node.js \u2013 Used for development tooling and documentation generation'),
];

// ---- CHAPTER 2 ----
const ch2Title = [
  sp(), sp(), sp(),
  centeredPara('CHAPTER 2', true, 30),
  centeredPara('SYSTEM ARCHITECTURE', true, 30),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: '═════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  sectionBreak(),
];
const ch2Content = [
  h2('A. System Architecture Diagram'),
  para('The Necry OER Portal follows a Decoupled Three-Tier Client-Server Architecture, where each tier operates independently and communicates through well-defined interfaces. This separation of concerns ensures maintainability, scalability, and independent deployment of each layer.', { indent: true }),

  ...embedDiagram('11-architecture.png', 'Figure 2.1: System Architecture \u2013 Three-Tier Diagram'),

  h3('Architecture Overview'),
  para('The architecture consists of three primary layers: (1) the Presentation Layer (React SPA) running in the user\'s browser, (2) the Application Layer (CodeIgniter 4 REST API) running on the web server, and (3) the Data Layer (MariaDB) running on the database server. Communication between layers is strictly through HTTP/HTTPS protocols with JSON as the data interchange format.', { indent: true }),

  h3('Component Diagram'),

  boldPara('Presentation Layer (Frontend)'),
  para('[React SPA] \u2194 [Axios HTTP Client] \u2192 JSON Requests', { paragraphOpts: { alignment: AlignmentType.LEFT } }),
  bullet('React 18 with component-based architecture'),
  bullet('Tailwind CSS for responsive UI styling'),
  bullet('JWT stored in localStorage for authenticated sessions'),
  bullet('15-second polling for notifications and profile sync'),

  boldPara('Application Layer (Backend API)'),
  para('[CodeIgniter 4] \u2192 [Controllers] \u2192 [Models] \u2192 [Query Builder]', { paragraphOpts: { alignment: AlignmentType.LEFT } }),
  bullet('RESTful API endpoints grouped by resource (auth, courses, users, admin)'),
  bullet('JWT authentication filter (AuthFilter) guards protected routes'),
  bullet('Role-based access control (admin, uploader, student)'),
  bullet('Email service via PHPMailer for transactional emails'),
  bullet('Device tracking and OTP verification services'),

  boldPara('Data Layer (Database)'),
  para('[MariaDB] \u2192 [InnoDB Engine] \u2192 [15 Tables]', { paragraphOpts: { alignment: AlignmentType.LEFT } }),
  bullet('15 relational tables with foreign key constraints'),
  bullet('ACID-compliant transactions for purchase and withdrawal operations'),
  bullet('Indexed columns for query performance optimization'),
  bullet('utf8mb4 charset for full Unicode support'),

  h3('Data Flow'),
  numberedItem(1, 'A user interacts with the React SPA in their browser.'),
  numberedItem(2, 'The SPA makes an HTTP request (GET/POST/PUT/DELETE) via Axios to the CodeIgniter 4 API.'),
  numberedItem(3, 'The request passes through CORS and authentication filters (if protected).'),
  numberedItem(4, 'The appropriate Controller processes the request, validates input, and calls the relevant Model.'),
  numberedItem(5, 'The Model executes SQL queries via CodeIgniter\'s Query Builder against MariaDB.'),
  numberedItem(6, 'Results flow back: Database \u2192 Model \u2192 Controller \u2192 JSON Response \u2192 React SPA \u2192 User Interface.'),

  ...embedDiagram('11-architecture.png', 'Figure 2.2: Data Flow \u2013 Component Interaction Diagram'),

  h3('Deployment Setup'),
  para('The system is deployed on a local or hosted web server (Apache/Nginx) with PHP 8.2 and MariaDB. The React frontend is served as a single-page application, while the CodeIgniter 4 API runs as a separate application under the same or a subdomain. The database server can be hosted on the same machine or a separate dedicated server.', { indent: true }),

  h3('System Workflow'),
  para('The following describes the high-level system workflow:', { indent: true }),
  numberedItem(1, 'User accesses the Necry OER Portal via web browser'),
  numberedItem(2, 'React SPA loads and renders the appropriate page based on URL routing'),
  numberedItem(3, 'Unauthenticated users can browse public catalog and view resource details'),
  numberedItem(4, 'Registration requires OTP verification via email before account creation'),
  numberedItem(5, 'Login generates a JWT token stored in localStorage for subsequent requests'),
  numberedItem(6, 'Email verification check occurs at login (unverified emails are blocked with 403)'),
  numberedItem(7, 'Device tracking records each login session and alerts on unrecognized devices'),
  numberedItem(8, 'Uploaders can submit materials which require admin approval before public visibility'),
  numberedItem(9, 'Purchases compute the best applicable discount (promo vs subscription, not stackable)'),
  numberedItem(10, 'Revenue is split 80% to uploader / 20% to platform upon each purchase'),
  numberedItem(11, 'Uploaders can request withdrawal of earnings after setting up payout accounts and PIN'),
  numberedItem(12, 'The system logs all transactions, access events, and user activities for auditing'),
];

// ---- CHAPTER 3 ----
const ch3Title = [
  sp(), sp(), sp(),
  centeredPara('CHAPTER 3', true, 30),
  centeredPara('UNIFIED MODELING LANGUAGE (UML)', true, 30),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: '═════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  sectionBreak(),
];
const ch3Content = [
  h2('A. Introduction to UML'),
  para('The Unified Modeling Language (UML) is a standardized modeling language used in software engineering to visualize, specify, construct, and document the artifacts of a software system. UML provides a set of graphical notation techniques to create visual models of object-oriented software systems.', { indent: true }),
  para('Importance of UML in System Development: UML helps developers and stakeholders understand the system architecture, behavior, and interactions through standardized diagrams. It bridges the gap between technical and non-technical team members, facilitates communication, and serves as documentation for future maintenance and enhancement.', { indent: true }),
  para('UML Diagrams Used in This Project: This project employs Use Case Diagrams to represent system functionality from the user\'s perspective, and Sequence Diagrams to illustrate the flow of interactions between system components over time.', { indent: true }),

  h2('B. Use Case Diagram'),

  ...embedDiagram('01-usecase.png', 'Figure 3.1: Complete Use Case Diagram'),

  para('The Use Case Diagram above illustrates the major functionalities of the Necry OER Portal and the actors that interact with them. The system has four primary actors: Administrator, Uploader, Student, and Guest User. Each actor has a specific set of use cases representing the actions they can perform within the system.', { indent: true }),

  boldPara('Actors and Their Responsibilities'),
  boldPara('Administrator \u2013 Responsible for overall system management and moderation'),
  bullet('Manage Users: View, verify, suspend, and reset passwords for all users'),
  bullet('Moderate Resources: Approve or reject uploaded materials'),
  bullet('Manage Departments/Courses: Add, update, and organize academic structures'),
  bullet('Process Withdrawals: Review and process payout requests from uploaders'),
  boldPara('Uploader \u2013 Responsible for content creation and monetization'),
  bullet('Upload Resources: Submit books and materials with metadata'),
  bullet('Manage Content: Edit, delete, and organize own uploaded materials'),
  bullet('Track Earnings: View sales, earnings, and transaction history'),
  bullet('Manage Payout Accounts: Set up GCash, Maya, or Bank accounts'),
  bullet('Request Withdrawals: Withdraw accumulated earnings'),
  boldPara('Student \u2013 Consumes educational content'),
  bullet('Register and Verify Email: Create account with OTP verification'),
  bullet('Browse and Search: Explore the digital library catalog'),
  bullet('Purchase Resources: Buy materials with discount computation'),
  bullet('Access Materials: Open and read purchased resources'),
  bullet('Upgrade Subscription: Subscribe to Pro or Pro+ tiers'),
  boldPara('Guest User \u2013 Explores public content'),
  bullet('Browse Catalog: View available resources and metadata'),
  bullet('Search: Look for specific titles or subjects'),

  h2('C. Use Case Descriptions'),
  sp(),

  ucTable([
    {
      name: 'User Registration',
      actor: 'Guest User',
      description: 'New user creates an account with OTP email verification',
      preconditions: 'User is not logged in. Email is not already registered.',
      mainFlow: '1. User fills registration form with name, email, password, role, and education level\n2. System sends OTP code to email\n3. User enters OTP code\n4. System validates OTP and creates account\n5. User is redirected to login',
      altFlow: 'OTP expires (15 min): User requests new code. Email already exists: System returns error.',
      postconditions: 'User account created with email_verified=1. JWT not issued (user must login).',
    },
    {
      name: 'User Login',
      actor: 'Student, Uploader, Administrator',
      description: 'Registered user authenticates with email and password',
      preconditions: 'User has a registered account with verified email.',
      mainFlow: '1. User enters email and password\n2. System validates credentials\n3. System checks email_verified status\n4. System checks login_attempts for IP lock\n5. System records device session and checks for unrecognized devices\n6. System issues JWT token\n7. User is redirected to dashboard',
      altFlow: 'Email not verified: Return 403 error. Too many attempts: Lock IP. Unrecognized device: Send email alert.',
      postconditions: 'User is authenticated with JWT. Device session recorded. Login attempt counter reset.',
    },
    {
      name: 'Forgot Password',
      actor: 'Student, Uploader',
      description: 'User resets password via email OTP verification',
      preconditions: 'User is not logged in. Email exists in system.',
      mainFlow: '1. User enters registered email\n2. System sends OTP code to email\n3. User enters OTP code\n4. System validates OTP\n5. User enters new password\n6. System updates password hash\n7. User is redirected to login',
      altFlow: 'OTP expires: User requests resend. Invalid OTP: Increment attempts counter.',
      postconditions: 'Password hash updated in database. Verification code marked as used.',
    },
    {
      name: 'Resource Upload',
      actor: 'Uploader',
      description: 'Uploader submits a new educational resource with metadata',
      preconditions: 'User is logged in with uploader role.',
      mainFlow: '1. Uploader fills resource metadata (title, author, ISBN, edition, publisher, description)\n2. Uploader selects department, course, and section\n3. Uploader uploads file (PDF) and cover image\n4. Uploader sets price, material type, and preview percentage\n5. System saves resource with is_approved=0\n6. System records upload transaction',
      altFlow: 'Validation fails: Return specific error. File too large: Return file size error.',
      postconditions: 'Resource created in database with pending approval status. Admin notified.',
    },
    {
      name: 'Resource Approval',
      actor: 'Administrator',
      description: 'Admin reviews and approves uploaded resources for public visibility',
      preconditions: 'User is logged in as administrator. Resources exist with is_approved=0.',
      mainFlow: '1. Admin views list of pending resources\n2. Admin reviews resource metadata and file\n3. Admin approves or rejects the resource\n4. System updates is_approved status\n5. Resource becomes visible in public catalog if approved',
      altFlow: 'Reject: Resource is deleted from the system.',
      postconditions: 'Resource is approved (is_approved=1) and publicly visible, or removed from system.',
    },
    {
      name: 'Purchase Resource',
      actor: 'Student',
      description: 'Student purchases a resource with best discount applied',
      preconditions: 'User is logged in. Resource is approved. User has not already purchased this resource.',
      mainFlow: '1. User views resource detail with price and discount information\n2. System computes best discount (promo discount vs subscription discount)\n3. User clicks Purchase and selects payment method (GCash, Maya, or Card)\n4. System processes payment (simulated)\n5. System records purchase with discounted price\n6. System computes revenue split: 80% uploader, 20% platform\n7. System records transactions for both parties\n8. System sends purchase receipt email\n9. User gains access to the resource',
      altFlow: 'Uploader owns the resource: Free access with no incentive recorded. Payment fails: Transaction marked as failed.',
      postconditions: 'Resource_purchases row created. User_transactions recorded. Email receipt sent.',
    },
    {
      name: 'Open Resource',
      actor: 'Student, Uploader',
      description: 'User opens and accesses a digital resource through secure streaming',
      preconditions: 'User is logged in and has access rights (purchased or uploader-owned).',
      mainFlow: '1. User clicks Open on a resource\n2. System checks access rights (purchased, uploader-owned, or free preview)\n3. System verifies open limits (if applicable)\n4. System records access in resource_access_logs\n5. System generates temporary access token\n6. Resource is displayed in the reader/viewer',
      altFlow: 'Uploader accessing own material: No limit check, no incentive. No access rights: Return 403. Limit reached: Show purchase prompt.',
      postconditions: 'Access log entry created. Resource displayed to user.',
    },
    {
      name: 'Subscription Upgrade',
      actor: 'Student',
      description: 'User upgrades subscription tier for enhanced benefits',
      preconditions: 'User is logged in. User is on a lower tier (free or pro).',
      mainFlow: '1. User selects subscription tier (Pro or Pro+)\n2. System displays tier benefits and price\n3. User selects payment method\n4. System processes payment (simulated)\n5. System updates subscription_tier and subscription_expires_at\n6. System sends upgrade confirmation email\n7. User gains tier benefits immediately',
      altFlow: 'Payment fails: Tier not updated. Already on tier: Return current status.',
      postconditions: 'User subscription tier updated. Benefits applied to future purchases.',
    },
    {
      name: 'Request Withdrawal',
      actor: 'Uploader',
      description: 'Uploader requests withdrawal of accumulated earnings',
      preconditions: 'User is logged in as uploader. User has payout_pin set. User has at least one payout account configured.',
      mainFlow: '1. User views earnings dashboard with current balance\n2. User navigates to Withdraw section\n3. User selects payout account and enters withdrawal amount\n4. System prompts for 6-digit payout PIN\n5. User enters PIN\n6. System verifies PIN hash\n7. System validates amount against available balance\n8. System creates withdrawal request with status=pending\n9. Admin reviews and processes the withdrawal',
      altFlow: 'Invalid PIN: Return error. Insufficient balance: Return error. No payout account: Prompt to add one first.',
      postconditions: 'Withdrawal request created with pending status. Balance unchanged until processed.',
    },
  ]),
];

// ---- CHAPTER 4 ----
const ch4Title = [
  sp(), sp(), sp(),
  centeredPara('CHAPTER 4', true, 30),
  centeredPara('SEQUENCE DIAGRAMS', true, 30),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: '═════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  sectionBreak(),
];
const ch4Content = [
  h2('A. Sequence Diagrams and Discussion'),
  para('Sequence diagrams illustrate the interactions between actors and system components over time. Each diagram below describes a specific use case, showing the message flow between the Actor, System Interface (React SPA), Application Logic (CodeIgniter 4 API), and Database (MariaDB).', { indent: true }),

  h3('1. User Authentication (Login)'),

  ...embedDiagram('02-sequence-login.png', 'Figure 4.1: User Authentication \u2013 Login Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'User enters email and password in the Login form (React SPA)'),
  numberedItem(2, 'SPA sends POST /auth/login with credentials to the API'),
  numberedItem(3, 'Auth controller validates credentials against users table (password_verify)'),
  numberedItem(4, 'System checks email_verified field \u2014 if 0, returns 403 error'),
  numberedItem(5, 'System checks login_attempts table for IP lockout'),
  numberedItem(6, 'On success, system records device session (IP, user agent, device name, location)'),
  numberedItem(7, 'System checks if device is trusted \u2014 if not, sends device alert email'),
  numberedItem(8, 'System generates JWT token and returns it to the frontend'),
  numberedItem(9, 'SPA stores token in localStorage and redirects to dashboard'),
  para('Database tables involved: users, login_attempts, user_sessions, verification_codes', { indent: true }),

  h3('2. OTP Registration'),

  ...embedDiagram('03-sequence-registration.png', 'Figure 4.2: OTP Registration Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'Guest fills registration form in the SignUp page'),
  numberedItem(2, 'SPA sends POST /auth/register/send-otp with email'),
  numberedItem(3, 'System generates 6-digit OTP via array_rand on [\'0\'..\'9\']'),
  numberedItem(4, 'System stores OTP in verification_codes table with type=\'email_verify\', 15-min expiry'),
  numberedItem(5, 'System sends OTP via email through PHPMailer'),
  numberedItem(6, 'User enters OTP code in step 2 of registration'),
  numberedItem(7, 'System validates OTP (checks expiry, max 1 attempt before new code, 3/hr limit)'),
  numberedItem(8, 'On valid OTP, system creates user account with email_verified=1'),
  numberedItem(9, 'User is redirected to login page'),
  para('Database tables involved: verification_codes, users', { indent: true }),

  h3('3. Resource Purchase with Discount'),

  ...embedDiagram('04-sequence-purchase.png', 'Figure 4.3: Resource Purchase Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'User views resource detail page (GET /resource/:id)'),
  numberedItem(2, 'System calls getBestDiscount() helper to compute applicable discount'),
  numberedItem(3, 'System checks user.promo_discount (e.g., 15% for Secondary, 20% for Tertiary)'),
  numberedItem(4, 'System checks user.subscription_tier (Pro=10%, Pro+=25%)'),
  numberedItem(5, 'System picks the higher of the two (not stackable) and displays breakdown'),
  numberedItem(6, 'User clicks Purchase and selects payment method'),
  numberedItem(7, 'System records purchase: listed_price, discount_percent, paid_amount'),
  numberedItem(8, 'System computes uploader_amount = paid_amount * 0.80, owner_amount = paid_amount * 0.20'),
  numberedItem(9, 'System records user_transactions for both uploader and platform'),
  numberedItem(10, 'System sends purchase receipt email to buyer'),
  para('Database tables involved: resources, resource_purchases, user_transactions, users', { indent: true }),

  h3('4. Uploader Opening Own Material'),

  ...embedDiagram('05-sequence-owner-open.png', 'Figure 4.4: Uploader Self-Open Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'Uploader navigates to one of their own uploaded materials'),
  numberedItem(2, 'Uploader clicks Open'),
  numberedItem(3, 'System checks if uploader_id matches the authenticated user'),
  numberedItem(4, 'If match: system grants free access WITHOUT checking resource_access_logs limits'),
  numberedItem(5, 'System does NOT record uploader_amount or owner_amount (no incentive)'),
  numberedItem(6, 'Resource is displayed in the viewer'),
  para('This is a distinct flow from regular user access \u2014 uploaders bypass purchase requirements, open limits, and revenue recording.', { indent: true }),

  h3('5. Subscription Upgrade'),

  ...embedDiagram('06-sequence-subscription.png', 'Figure 4.5: Subscription Upgrade Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'User navigates to Dashboard > Subscription section'),
  numberedItem(2, 'User selects Pro or Pro+ tier and clicks Upgrade'),
  numberedItem(3, 'SPA shows PaymentModal for method selection'),
  numberedItem(4, 'On payment confirmation, SPA sends POST /auth/upgrade'),
  numberedItem(5, 'System validates current tier and processes upgrade'),
  numberedItem(6, 'System updates subscription_tier and subscription_expires_at'),
  numberedItem(7, 'System sends upgrade confirmation email'),
  numberedItem(8, 'Dashboard refreshes to show updated tier and new benefits'),
  para('Discounts: Pro = 10% off all purchases, Pro+ = 25% off all purchases.', { indent: true }),

  h3('6. Resource Upload and Approval'),

  ...embedDiagram('07-sequence-upload-approval.png', 'Figure 4.6: Resource Upload and Approval Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'Uploader fills upload form with metadata and file'),
  numberedItem(2, 'SPA sends POST /upload/resource as FormData'),
  numberedItem(3, 'System validates file type and size, saves file to server'),
  numberedItem(4, 'System creates resource record with is_approved=0'),
  numberedItem(5, 'Admin accesses AdminDashboard, views pending resources'),
  numberedItem(6, 'Admin reviews resource and clicks Approve'),
  numberedItem(7, 'System sets is_approved=1, resource becomes publicly visible'),
  numberedItem(8, 'If rejected, resource is deleted from database and file system'),
  para('Database tables involved: resources, courses, departments, course_sections, tags, resource_tags', { indent: true }),

  h3('7. Withdrawal Request'),

  ...embedDiagram('08-sequence-withdrawal.png', 'Figure 4.7: Withdrawal Request Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'Uploader views earnings dashboard showing current balance'),
  numberedItem(2, 'Uploader navigates to Withdraw section, selects payout account'),
  numberedItem(3, 'Uploader enters amount and clicks Withdraw'),
  numberedItem(4, 'System prompts for 6-digit payout PIN via modal'),
  numberedItem(5, 'Uploader enters PIN (direct keyboard input, no numpad)'),
  numberedItem(6, 'System verifies PIN using password_verify against stored payout_pin hash'),
  numberedItem(7, 'System validates amount <= available balance'),
  numberedItem(8, 'System creates withdrawal record with status=pending'),
  numberedItem(9, 'Admin reviews and processes withdrawal (marks as withdrawn or failed)'),
  para('Database tables involved: users (payout_pin), payout_accounts, withdrawals, user_transactions', { indent: true }),

  h3('8. Resource Search and Delete'),

  ...embedDiagram('09-sequence-delete.png', 'Figure 4.8: Resource Delete Sequence'),

  para('Flow:', { indent: true }),
  numberedItem(1, 'Uploader views their own uploaded resources via GET /upload/my'),
  numberedItem(2, 'System filters resources by uploader_id (JWT ownership verification)'),
  numberedItem(3, 'Uploader can search within their own resources by title'),
  numberedItem(4, 'Uploader clicks Delete on a resource'),
  numberedItem(5, 'System shows confirmation dialog'),
  numberedItem(6, 'On confirm, SPA sends DELETE /upload/delete/:id'),
  numberedItem(7, 'System verifies ownership (uploader_id matches JWT user_id)'),
  numberedItem(8, 'System deletes resource from database (cascades to resource_tags, resource_purchases, etc.)'),
  numberedItem(9, 'System deletes file from server file system'),
  para('Database tables involved: resources (ON DELETE CASCADE to resource_tags, resource_purchases, resource_access_logs, user_transactions)', { indent: true }),
];

// ---- CHAPTER 5 ----
const ch5Title = [
  sp(), sp(), sp(),
  centeredPara('CHAPTER 5', true, 30),
  centeredPara('DATABASE DESIGN', true, 30),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: '═════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  sectionBreak(),
];
const ch5Content = [
  h2('A. Entity Relationship Diagram (ERD)'),

  ...embedDiagram('10-erd.png', 'Figure 5.1: Complete Entity Relationship Diagram'),

  para('The Necry OER Portal database consists of 15 tables designed to support user management, content storage, purchase transactions, access control, notifications, and financial operations. The ERD follows a normalized relational schema with InnoDB engine for ACID compliance and foreign key constraints for referential integrity.', { indent: true }),

  h2('B. Overview of Entities'),
  boldPara('Core Entities (5)'),
  bullet('users \u2013 Stores all user accounts with authentication, role, subscription, and verification data'),
  bullet('resources \u2013 Stores all uploaded educational materials with metadata and pricing'),
  bullet('departments \u2013 Academic departments/colleges for organizing courses'),
  bullet('courses \u2013 Academic courses belonging to departments'),
  bullet('course_sections \u2013 Sections within courses for organizing resources'),
  boldPara('Feature Entities (9)'),
  bullet('resource_purchases \u2013 Records of completed resource purchases with pricing and revenue split'),
  bullet('resource_access_logs \u2013 Tracks user access to resources for usage monitoring and limit enforcement'),
  bullet('user_transactions \u2013 Financial audit trail for all monetary operations'),
  bullet('withdrawals \u2013 Uploader withdrawal requests and their processing status'),
  bullet('notifications \u2013 In-app notification system for user alerts'),
  bullet('verification_codes \u2013 OTP codes for email verification and password reset'),
  bullet('user_sessions \u2013 Device login tracking for security and unrecognized device detection'),
  bullet('payout_accounts \u2013 Uploader payout method configuration (GCash, Maya, Bank)'),
  bullet('login_attempts \u2013 Brute force protection through IP-based login attempt tracking'),
  boldPara('Mapping Entities (1)'),
  bullet('resource_tags \u2013 Many-to-many relationship between resources and tags'),
  boldPara('Supporting Entities (2)'),
  bullet('user_details \u2013 Extended user profile information'),
  bullet('tags \u2013 Resource categorization tags'),

  h2('C. Database Schema (Data Dictionary)'),
  sp(),

  h3('Table: users'),
  dataDictTable([
    { field: 'user_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Unique user identifier' },
    { field: 'name', type: 'VARCHAR', length: '255', constraints: 'NOT NULL', description: 'Full name of the user' },
    { field: 'email', type: 'VARCHAR', length: '100', constraints: 'NOT NULL, UNIQUE', description: 'Email address for login and notifications' },
    { field: 'password_hash', type: 'VARCHAR', length: '255', constraints: 'NOT NULL', description: 'Bcrypt hashed password' },
    { field: 'email_verified', type: 'TINYINT', length: '1', constraints: 'NOT NULL, DEFAULT 1', description: 'Email verification status (0=pending, 1=verified)' },
    { field: 'role', type: 'ENUM', length: '-', constraints: 'NOT NULL', description: 'User role: admin, student, uploader' },
    { field: 'account_type', type: 'ENUM', length: '-', constraints: 'NOT NULL, DEFAULT student', description: 'Account classification: regular, student' },
    { field: 'education_level', type: 'ENUM', length: '-', constraints: 'NOT NULL, DEFAULT none', description: 'Education level: none, secondary, tertiary' },
    { field: 'promo_discount', type: 'DECIMAL', length: '5,2', constraints: 'NOT NULL, DEFAULT 0.00', description: 'Lifetime promo discount percentage' },
    { field: 'subscription_tier', type: 'ENUM', length: '-', constraints: 'NOT NULL, DEFAULT free', description: 'Subscription tier: free, pro, pro_plus' },
    { field: 'subscription_expires_at', type: 'DATETIME', length: '-', constraints: 'NULL', description: 'Subscription expiry timestamp' },
    { field: 'payout_pin', type: 'VARCHAR', length: '255', constraints: 'NULL', description: 'Bcrypt hashed 6-digit payout PIN' },
    { field: 'is_blocked', type: 'TINYINT', length: '1', constraints: 'NOT NULL, DEFAULT 0', description: 'Account blocked status' },
    { field: 'created_at', type: 'TIMESTAMP', length: '-', constraints: 'NOT NULL, DEFAULT CURRENT_TIMESTAMP', description: 'Account creation timestamp' },
  ]),
  sp(),
  h3('Table: resources'),
  dataDictTable([
    { field: 'resource_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Unique resource identifier' },
    { field: 'section_id', type: 'INT', length: '11', constraints: 'FK \u2192 course_sections.section_id', description: 'Course section for organization' },
    { field: 'dept_id', type: 'INT', length: '11', constraints: 'FK \u2192 departments.dept_id, ON DELETE SET NULL', description: 'Department classification' },
    { field: 'uploader_id', type: 'INT', length: '11', constraints: 'FK \u2192 users.user_id', description: 'Uploader who submitted the resource' },
    { field: 'title', type: 'VARCHAR', length: '255', constraints: 'NOT NULL', description: 'Resource title' },
    { field: 'book_author', type: 'VARCHAR', length: '150', constraints: 'NULL', description: 'Original author of the material' },
    { field: 'isbn', type: 'VARCHAR', length: '20', constraints: 'NULL', description: 'ISBN number if applicable' },
    { field: 'price', type: 'DECIMAL', length: '10,2', constraints: 'NOT NULL, DEFAULT 0.00', description: 'Purchase price' },
    { field: 'file_path', type: 'VARCHAR', length: '255', constraints: 'NOT NULL', description: 'Path to uploaded file' },
    { field: 'file_type', type: 'VARCHAR', length: '50', constraints: 'NOT NULL', description: 'File type: pdf, link, epub' },
    { field: 'material_type', type: 'ENUM', length: '-', constraints: 'NOT NULL, DEFAULT book', description: 'Type: book, resource' },
    { field: 'owner_share_percent', type: 'DECIMAL', length: '5,2', constraints: 'NOT NULL, DEFAULT 20.00', description: 'Platform revenue share percentage' },
    { field: 'preview_percent', type: 'TINYINT', length: '4', constraints: 'NOT NULL, DEFAULT 20', description: 'Percentage available for free preview' },
    { field: 'is_approved', type: 'TINYINT', length: '1', constraints: 'NOT NULL, DEFAULT 0', description: 'Admin approval status (0=pending, 1=approved)' },
    { field: 'created_at', type: 'TIMESTAMP', length: '-', constraints: 'NOT NULL, DEFAULT CURRENT_TIMESTAMP', description: 'Upload timestamp' },
  ]),
  sp(),
  h3('Table: resource_purchases'),
  dataDictTable([
    { field: 'purchase_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Unique purchase identifier' },
    { field: 'user_id', type: 'INT', length: '11', constraints: 'FK \u2192 users.user_id, ON DELETE CASCADE', description: 'Buyer user ID' },
    { field: 'resource_id', type: 'INT', length: '11', constraints: 'FK \u2192 resources.resource_id, ON DELETE CASCADE', description: 'Purchased resource ID' },
    { field: 'listed_price', type: 'DECIMAL', length: '10,2', constraints: 'NOT NULL', description: 'Original listed price before discount' },
    { field: 'discount_percent', type: 'DECIMAL', length: '5,2', constraints: 'NOT NULL, DEFAULT 0.00', description: 'Applied discount percentage' },
    { field: 'paid_amount', type: 'DECIMAL', length: '10,2', constraints: 'NOT NULL', description: 'Actual amount paid after discount' },
    { field: 'uploader_amount', type: 'DECIMAL', length: '10,2', constraints: 'NOT NULL, DEFAULT 0.00', description: 'Uploader earnings (80% of paid amount)' },
    { field: 'owner_amount', type: 'DECIMAL', length: '10,2', constraints: 'NOT NULL, DEFAULT 0.00', description: 'Platform earnings (20% of paid amount)' },
    { field: 'payment_method', type: 'ENUM', length: '-', constraints: 'NULL', description: 'Payment method: card, gcash, maya' },
    { field: 'status', type: 'ENUM', length: '-', constraints: 'NOT NULL, DEFAULT completed', description: 'Purchase status: completed, failed' },
    { field: 'purchased_at', type: 'TIMESTAMP', length: '-', constraints: 'NOT NULL, DEFAULT CURRENT_TIMESTAMP', description: 'Purchase timestamp' },
  ]),
  sp(),
  h3('Table: verification_codes'),
  dataDictTable([
    { field: 'code_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Unique code identifier' },
    { field: 'email', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Email address for verification' },
    { field: 'code', type: 'VARCHAR', length: '6', constraints: 'NOT NULL', description: '6-digit OTP code' },
    { field: 'type', type: 'ENUM', length: '-', constraints: 'NOT NULL', description: 'Code type: email_verify, password_reset' },
    { field: 'used', type: 'TINYINT', length: '1', constraints: 'NOT NULL, DEFAULT 0', description: 'Whether code has been used' },
    { field: 'attempts', type: 'TINYINT', length: '4', constraints: 'NOT NULL, DEFAULT 0', description: 'Verification attempt count' },
    { field: 'expires_at', type: 'DATETIME', length: '-', constraints: 'NOT NULL', description: 'Code expiration timestamp (15 min)' },
    { field: 'created_at', type: 'TIMESTAMP', length: '-', constraints: 'NOT NULL, DEFAULT CURRENT_TIMESTAMP', description: 'Code creation timestamp' },
  ]),
  sp(),
  h3('Table: user_sessions'),
  dataDictTable([
    { field: 'session_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Unique session identifier' },
    { field: 'user_id', type: 'INT', length: '11', constraints: 'FK \u2192 users.user_id, ON DELETE CASCADE', description: 'User who owns this session' },
    { field: 'ip_address', type: 'VARCHAR', length: '45', constraints: 'NOT NULL', description: 'IP address of login' },
    { field: 'user_agent', type: 'VARCHAR', length: '255', constraints: 'NOT NULL', description: 'Browser user agent string' },
    { field: 'device_name', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Parsed device/browser name' },
    { field: 'location', type: 'VARCHAR', length: '100', constraints: 'NOT NULL, DEFAULT Unknown', description: 'Geolocation from IP (via ip-api.com)' },
    { field: 'is_trusted', type: 'TINYINT', length: '1', constraints: 'NOT NULL, DEFAULT 0', description: 'Whether user has trusted this device' },
    { field: 'last_login_at', type: 'TIMESTAMP', length: '-', constraints: 'NOT NULL, DEFAULT CURRENT_TIMESTAMP', description: 'Last login timestamp' },
  ]),
  sp(),
  h3('Table: payout_accounts'),
  dataDictTable([
    { field: 'account_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Unique account identifier' },
    { field: 'user_id', type: 'INT', length: '11', constraints: 'FK \u2192 users.user_id, ON DELETE CASCADE', description: 'Uploader who owns this account' },
    { field: 'account_type', type: 'ENUM', length: '-', constraints: 'NOT NULL', description: 'Account type: gcash, maya, bank' },
    { field: 'account_number', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Account number or GCash/Maya number' },
    { field: 'account_name', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Account holder name' },
    { field: 'card_number', type: 'VARCHAR', length: '20', constraints: 'NULL (bank only)', description: 'Bank card number' },
    { field: 'expiry_date', type: 'VARCHAR', length: '10', constraints: 'NULL (bank only)', description: 'Card expiry date (MM/YY)' },
    { field: 'cvv', type: 'VARCHAR', length: '4', constraints: 'NULL (bank only)', description: 'Card CVV code' },
  ]),
  sp(),
  h3('Additional Tables'),
  boldPara('departments'),
  dataDictTable([
    { field: 'dept_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Department ID' },
    { field: 'dept_name', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Department name' },
    { field: 'description', type: 'TEXT', length: '-', constraints: 'NULL', description: 'Department description' },
  ]),
  sp(),
  boldPara('courses'),
  dataDictTable([
    { field: 'course_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Course ID' },
    { field: 'title', type: 'VARCHAR', length: '200', constraints: 'NOT NULL', description: 'Course title' },
    { field: 'dept_id', type: 'INT', length: '11', constraints: 'FK \u2192 departments.dept_id, ON DELETE CASCADE', description: 'Parent department' },
  ]),
  sp(),
  boldPara('course_sections'),
  dataDictTable([
    { field: 'section_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Section ID' },
    { field: 'course_id', type: 'INT', length: '11', constraints: 'FK \u2192 courses.course_id', description: 'Parent course' },
    { field: 'section_name', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Section name' },
    { field: 'sort_order', type: 'INT', length: '11', constraints: 'NOT NULL, DEFAULT 0', description: 'Display sort order' },
  ]),
  sp(),
  boldPara('login_attempts'),
  dataDictTable([
    { field: 'attempt_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Attempt record ID' },
    { field: 'email', type: 'VARCHAR', length: '100', constraints: 'NOT NULL', description: 'Email being attempted' },
    { field: 'ip_address', type: 'VARCHAR', length: '45', constraints: 'NOT NULL', description: 'IP address of the attempt' },
    { field: 'attempts', type: 'INT', length: '11', constraints: 'NOT NULL, DEFAULT 0', description: 'Consecutive failed attempts' },
    { field: 'locked_until', type: 'DATETIME', length: '-', constraints: 'NULL', description: 'Lockout expiration timestamp' },
  ]),
  sp(),
  boldPara('notifications'),
  dataDictTable([
    { field: 'notif_id', type: 'INT', length: '11', constraints: 'PRIMARY KEY, AUTO_INCREMENT', description: 'Notification ID' },
    { field: 'user_id', type: 'INT', length: '11', constraints: 'FK \u2192 users.user_id, ON DELETE CASCADE', description: 'Recipient user' },
    { field: 'title', type: 'VARCHAR', length: '150', constraints: 'NOT NULL', description: 'Notification title' },
    { field: 'message', type: 'TEXT', length: '-', constraints: 'NOT NULL', description: 'Notification message body' },
    { field: 'is_read', type: 'TINYINT', length: '1', constraints: 'NOT NULL, DEFAULT 0', description: 'Read status (0=unread, 1=read)' },
  ]),
  sp(),
  boldPara('resource_access_logs, user_transactions, withdrawals'),
  para('The remaining tables round out the schema: resource_access_logs (access_id, user_id, resource_id, opened_at) tracks user open events; user_transactions (transaction_id, user_id, resource_id, type, amount, uploader_amount, owner_amount) provides the financial audit trail; withdrawals (withdrawal_id, user_id, amount, method, account_number, account_name, status) stores payout requests.', { indent: true }),

  h2('D. Relationship Description'),
  boldPara('One-to-Many Relationships'),
  bullet('users \u2192 resources: One uploader can submit many resources'),
  bullet('users \u2192 resource_purchases: One user can make many purchases'),
  bullet('users \u2192 user_sessions: One user can have many device sessions'),
  bullet('users \u2192 payout_accounts: One uploader can have multiple payout accounts'),
  bullet('users \u2192 notifications: One user can receive many notifications'),
  bullet('departments \u2192 courses: One department contains many courses'),
  bullet('courses \u2192 course_sections: One course contains many sections'),
  bullet('resources \u2192 resource_purchases: One resource can be purchased by many users'),
  bullet('resources \u2192 resource_access_logs: One resource can be accessed many times'),
  boldPara('Many-to-Many Relationships'),
  bullet('resources \u2192 tags (via resource_tags): Resources can have multiple tags; tags can apply to multiple resources'),
  boldPara('One-to-One Relationships'),
  bullet('users \u2192 user_details: Each user has exactly one extended profile record'),
  para('All foreign key relationships use ON DELETE CASCADE for dependent entities, ensuring data integrity when parent records are removed. The resources.dept_id uses ON DELETE SET NULL to preserve resource records if a department is deleted.', { indent: true }),
];

// ---- CHAPTER 6 ----
const ch6Title = [
  sp(), sp(), sp(),
  centeredPara('CHAPTER 6', true, 30),
  centeredPara('SQL IMPLEMENTATION OF CRUD OPERATIONS', true, 30),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: '═════════════════════════════════', font: FONT, size: 24, color: '4472C4' })],
  }),
  sectionBreak(),
];
const ch6Content = [
  h2('A. Data Entry (CREATE)'),
  para('Data entry in the Necry OER Portal is primarily handled through resource uploads. Uploaders submit educational materials with complete metadata through a multi-field form. The data flows from the frontend React form through the backend API into the MariaDB database.', { indent: true }),

  h3('Step 1: Upload Form (Frontend)'),

  screenshotBox('Data Entry Screenshot: Upload Resource Form',
    'Insert screenshot of the Upload Resource form showing all input fields: Title, Author, ISBN, Edition, Publisher, Page Count, Language, Description, File Upload (PDF), Cover Image, Department dropdown, Course dropdown, Section dropdown, Price, Material Type, Preview Percentage, and Submit button.'),

  para('The upload form captures the following fields: title, book_author, ISBN, edition, publisher, page_count, language_code, description, file upload (PDF/EPUB), cover image (JPG/PNG), department, course, section, price, material_type (book or resource), and preview_percentage.', { indent: true }),

  h3('Step 2: Form Submission Handler'),
  boldPara('Frontend (React) \u2013 Upload form submission via Axios:'),
  codeBox(`const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', form.title);
  formData.append('book_author', form.author);
  formData.append('isbn', form.isbn);
  formData.append('edition', form.edition);
  formData.append('publisher', form.publisher);
  formData.append('page_count', form.pageCount);
  formData.append('description', form.description);
  formData.append('price', form.price);
  formData.append('material_type', form.materialType);
  formData.append('preview_percent', form.previewPercent);
  formData.append('file', form.file);
  formData.append('cover', form.coverImage);
  formData.append('dept_id', form.deptId);
  formData.append('course_id', form.courseId);
  formData.append('section_id', form.sectionId);
  await axios.post('/upload/resource', formData, {
    headers: { Authorization: 'Bearer ' + token }
  });
  toast.success('Resource uploaded successfully!');
}`),

  sp(),
  h3('Step 3: Backend Validation and Database Insertion'),
  boldPara('Backend (CodeIgniter 4 PHP) \u2013 UploadController.create():'),
  codeBox(`public function create() {
  // Server-side validation
  $rules = [
    'title' => 'required|min_length[3]|max_length[255]',
    'price' => 'required|numeric',
    'file'  => 'uploaded[file]|max_size[file,102400]'
            + '|ext_in[file,pdf,epub]',
    'cover' => 'max_size[cover,5120]'
            + '|ext_in[cover,jpg,jpeg,png]',
  ];
  if (!$this->validate($rules))
    return $this->fail($this->validator->getErrors());

  // File processing
  $file = $this->request->getFile('file');
  $fileName = $file->getRandomName();
  $file->move(FCPATH . 'uploads/resources', $fileName);

  // Database insertion
  $data = [
    'uploader_id'   => $userId,
    'title'         => $this->request->getPost('title'),
    'book_author'   => $this->request->getPost('book_author'),
    'isbn'          => $this->request->getPost('isbn'),
    'price'         => $this->request->getPost('price'),
    'file_path'     => 'uploads/resources/' . $fileName,
    'file_type'     => $file->getClientExtension(),
    'material_type' => $this->request->getPost('material_type'),
    'is_approved'   => 0, // Pending admin approval
  ];
  $resourceModel = new ResourceModel();
  $resourceModel->insert($data);
  return $this->respondCreated([
    'resource_id' => $resourceModel->getInsertID()
  ]);
}`),

  sp(),
  h3('Data Flow Summary'),
  para('The data flows through three layers:', { indent: true }),
  numberedItem(1, 'Frontend (React): User fills form \u2192 client-side validation \u2192 FormData assembled \u2192 Axios POST with JWT'),
  numberedItem(2, 'Backend (CI4): Route matched \u2192 AuthFilter verifies JWT \u2192 UploadController.create() validates rules \u2192 File saved to filesystem \u2192 Query Builder INSERT into resources table'),
  numberedItem(3, 'Database (MariaDB): INSERT executed \u2192 AUTO_INCREMENT generates resource_id \u2192 New row with is_approved=0 \u2192 INSERT ID returned to controller \u2192 JSON response to frontend'),

  h2('B. Data Views (READ)'),
  para('Data retrieval is implemented across multiple views: the public catalog, resource details, user purchase history, and admin management pages. All read operations follow a similar pattern of API request, controller processing, and data formatting.', { indent: true }),

  h3('Screenshot: Catalog Listing'),

  screenshotBox('Data View Screenshot: Catalog Listing Page',
    'Insert screenshot of the Home page showing: search bar, department/subject filter, "New Arrivals" section, "Trending" section, and the full catalog grid showing resource cards with cover image, title, price/discount badge, and author.'),

  screenshotBox('Data View Screenshot: Resource Detail Page',
    'Insert screenshot of the Resource Detail page showing: cover image, title, author, ISBN, price breakdown with discount badge (e.g., "20% OFF - Promo Discount"), description, preview section, and Open/Purchase buttons.'),

  h3('Source Code: Retrieving the Resource Catalog'),
  boldPara('Frontend \u2013 Fetching courses and recent resources:'),
  codeBox(`// React component (Home.js)
const [courses, setCourses] = useState([]);
const [recent, setRecent] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const [coursesRes, recentRes] = await Promise.all([
      axios.get('/courses'),
      axios.get('/courses/recent')
    ]);
    setCourses(coursesRes.data);
    setRecent(recentRes.data);
  };
  fetchData();
}, []);`),

  sp(),
  boldPara('Backend \u2013 Listing approved resources with discount info:'),
  codeBox(`public function index() {
  $resourceModel = new ResourceModel();
  $resources = $resourceModel
    ->select('resources.*, departments.dept_name')
    ->join('departments',
      'departments.dept_id = resources.dept_id', 'left')
    ->where('resources.is_approved', 1)
    ->orderBy('resources.created_at', 'DESC')
    ->findAll();

  // Compute discounts for authenticated users
  if ($tokenData = $this->getJWTData()) {
    $userModel = new UserModel();
    $user = $userModel->find($tokenData->user_id);
    foreach ($resources as &$res) {
      $res->best_discount =
        $this->getBestDiscount($user);
      $res->discounted_price =
        $res->price * (1 - $res->best_discount / 100);
    }
  }
  return $this->respond($resources);
}`),

  sp(),
  h3('Retrieval Process'),
  para('The React frontend sends GET requests to API endpoints. The backend controller queries the resources table using CodeIgniter\'s Query Builder, applying filters (is_approved=1 for public catalog), joins (departments for display), and optional discount computation for authenticated users via getBestDiscount(). Results are returned as JSON and rendered by React components into card layouts.', { indent: true }),

  h2('C. Data Manipulation (UPDATE)'),
  para('Update operations include resource approval by administrators, user profile updates, subscription tier upgrades, and payout PIN configuration. The most critical update flow is the resource approval process.', { indent: true }),

  h3('Screenshot: Admin Approval'),

  screenshotBox('Data Manipulation Screenshot: Admin Resource Approval',
    'Insert screenshot of the Admin Dashboard showing: list of pending resources/books with title, uploader, date, and Approve/Reject buttons. Show the state before and after clicking Approve.'),

  h3('Source Code: Approving a Resource'),
  boldPara('Frontend \u2013 Admin approval action:'),
  codeBox(`// AdminDashboard.js
const handleApprove = async (resourceId) => {
  try {
    const res = await axios.post(
      \`/admin/resource/approve/\${resourceId}\`,
      {},
      { headers: { Authorization: 'Bearer ' + token } }
    );
    // Remove from pending list
    setPendingBooks(prev =>
      prev.filter(b => b.resource_id !== resourceId)
    );
    toast.success('Resource approved successfully');
  } catch (err) {
    toast.error('Approval failed: ' +
      (err.response?.data?.message || err.message));
  }
};`),

  sp(),
  boldPara('Backend \u2013 Setting is_approved=1 and notifying uploader:'),
  codeBox(`public function approveResource($resourceId) {
  $resourceModel = new ResourceModel();
  $resource = $resourceModel->find($resourceId);
  if (!$resource)
    return $this->failNotFound('Resource not found');

  // UPDATE query
  $resourceModel->update($resourceId, [
    'is_approved' => 1
  ]);

  // Notify the uploader
  $notifModel = new NotificationModel();
  $notifModel->insert([
    'user_id' => $resource['uploader_id'],
    'title'   => 'Resource Approved',
    'message' => 'Your resource "'
      . $resource['title'] . '" has been approved.',
  ]);

  return $this->respondUpdated([
    'message' => 'Resource approved successfully'
  ]);
}`),

  sp(),
  h3('Update Workflow'),
  para('The administrator reviews pending resources and clicks Approve. The frontend sends a POST request with the resource ID. The backend validates the resource exists, sets is_approved=1 in the resources table via an UPDATE query, sends a notification to the uploader, and returns success. The frontend removes the item from the pending list and shows a success message. This follows the MVC pattern: View (React) \u2192 Controller (approveResource) \u2192 Model (update) \u2192 Database.', { indent: true }),

  h2('D. Search and Delete Records (DELETE)'),
  para('Uploaders can manage their own content library by searching within their uploaded resources and deleting materials they own. The system enforces ownership verification before any deletion operation.', { indent: true }),

  h3('Screenshot: My Uploads with Search and Delete'),

  screenshotBox('Search and Delete Screenshot: My Uploads Page',
    'Insert screenshot of the My Uploads section showing: list of uploaded resources with search/filter bar, each resource card showing title, status (approved/pending), price, and a Delete button. Also show the confirmation dialog that appears when Delete is clicked.'),

  h3('Source Code: Searching and Deleting Resources'),
  boldPara('Frontend \u2013 Search filter and delete handler:'),
  codeBox(`// Dashboard.js - My Uploads tab
const [myResources, setMyResources] = useState([]);
const [searchTerm, setSearchTerm] = useState('');

// Fetch resources
useEffect(() => {
  axios.get('/upload/my', {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => setMyResources(res.data));
}, []);

// Client-side search filter
const filtered = myResources.filter(r =>
  r.title.toLowerCase()
   .includes(searchTerm.toLowerCase())
);

// Delete with confirmation
const handleDelete = async (resourceId) => {
  if (!window.confirm(
    'Are you sure you want to delete this resource?'))
    return;
  try {
    await axios.delete(
      \`/upload/delete/\${resourceId}\`,
      { headers: { Authorization: 'Bearer ' + token } }
    );
    setMyResources(prev =>
      prev.filter(r => r.resource_id !== resourceId)
    );
    toast.success('Resource deleted');
  } catch (err) {
    toast.error('Delete failed');
  }
};`),

  sp(),
  boldPara('Backend \u2013 Ownership verification and DELETE with cascade:'),
  codeBox(`public function deleteMyResource($resourceId) {
  $resourceModel = new ResourceModel();
  $userId = $this->getJWTData()->user_id;

  // Ownership verification
  $resource = $resourceModel
    ->where('resource_id', $resourceId)
    ->where('uploader_id', $userId)
    ->first();

  if (!$resource)
    return $this->failNotFound(
      'Resource not found or access denied');

  // DELETE from database (CASCADE handles related)
  $resourceModel->delete($resourceId);

  // Delete physical file
  $filePath = FCPATH . $resource['file_path'];
  if (file_exists($filePath))
    unlink($filePath);

  return $this->respondDeleted([
    'message' => 'Resource deleted successfully'
  ]);
}`),

  sp(),
  h3('Search and Delete Process'),
  para('Uploaders view their own resources fetched via GET /upload/my (filtered by JWT user_id in the WHERE clause). Client-side search filtering allows real-time title matching without additional API calls. When deleting, the frontend shows a confirmation dialog, then sends a DELETE request. The backend performs ownership verification (matching resource_id AND uploader_id), then executes a DELETE query \u2014 ON DELETE CASCADE in the database schema automatically removes related records in resource_tags, resource_purchases, resource_access_logs, and user_transactions. Finally, the physical file is removed from the server filesystem.', { indent: true }),

  h2('E. Complete CRUD Matrix'),
  para('The following table summarizes the CRUD operations and their corresponding API endpoints across all major entities:', { indent: true }),
  sp(),

  crudTable([
    ['users', 'POST /auth/register', 'GET /user/profile', 'POST /user/profile-image', 'Admin via admin panel'],
    ['resources', 'POST /upload/resource', 'GET /courses, GET /resource/:id', 'POST /admin/resource/approve/:id', 'DELETE /upload/delete/:id'],
    ['resource_purchases', 'POST /resource/:id/purchase', 'GET /user/purchases', 'N/A (immutable)', 'N/A (audit trail)'],
    ['withdrawals', 'POST /user/withdrawal/request', 'GET /user/withdrawal/history', 'Admin processing', 'N/A (audit trail)'],
    ['payout_accounts', 'POST /user/payout/account/add', 'GET /user/payout/info', 'N/A (delete+re-add)', 'DELETE /user/payout/account/delete/:id'],
    ['notifications', 'System-generated', 'GET /user/notifications', 'POST /user/notification/read/:id', 'DELETE /user/notification/delete/:id'],
  ]),
  sp(),

  h2('F. Submission Requirements'),
  sp(),
  new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Requirement', font: FONT, size: 20, bold: true, color: 'FFFFFF' })],
              alignment: AlignmentType.CENTER,
            })],
            shading: { type: ShadingType.CLEAR, fill: '4472C4' },
            borders: THIN_BORDER,
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Description', font: FONT, size: 20, bold: true, color: 'FFFFFF' })],
              alignment: AlignmentType.CENTER,
            })],
            shading: { type: ShadingType.CLEAR, fill: '4472C4' },
            borders: THIN_BORDER,
          }),
        ],
      }),
      ...[
        ['1. Printed Documentation', 'One (1) Printed and Soft-Bound Copy (Orange Color Tape Binding)'],
        ['2. Digital Copy', 'One (1) Digital Copy (PDF Format)'],
        ['3. Source Code', 'Project Source Code (Softcopy)'],
        ['4. Database File', 'SQL Database File'],
        ['5. Rating Sheet', 'Accomplished Rating Sheet'],
      ].map((r, idx) => new TableRow({
        children: r.map(cell => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: cell, font: FONT, size: 18 })],
            spacing: { after: 20 },
          })],
          shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? 'FFFFFF' : 'F2F7FB' },
          borders: THIN_BORDER,
        })),
      })),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }),
  sp(),
  sp(),
  para('Failure to comply with the documentation format and submission requirements may affect the project evaluation and grading.', { bold: true }),
];

// =====================================================================
// BUILD THE DOCUMENT
// =====================================================================

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: FS },
        paragraph: { spacing: { line: 360 } },
      },
      heading1: {
        run: { font: FONT, size: FS, bold: true },
        paragraph: { spacing: { before: 360, after: 200 }, alignment: AlignmentType.LEFT },
      },
      heading2: {
        run: { font: FONT, size: FS, bold: true },
        paragraph: { spacing: { before: 280, after: 160 }, alignment: AlignmentType.LEFT },
      },
      heading3: {
        run: { font: FONT, size: FS, bold: true },
        paragraph: { spacing: { before: 200, after: 120 }, alignment: AlignmentType.LEFT },
      },
    },
  },
  sections: [
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1728 } } }, children: coverPage },
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1728 } } }, children: tocSection },
    createChapterSection(ch1Title, ch1Content),
    createChapterSection(ch2Title, ch2Content),
    createChapterSection(ch3Title, ch3Content),
    createChapterSection(ch4Title, ch4Content),
    createChapterSection(ch5Title, ch5Content),
    createChapterSection(ch6Title, ch6Content),
  ],
});

(async () => {
  const buffer = await Packer.toBuffer(doc);
  const outName = 'Moreno_Ducuments.docx';
  fs.writeFileSync(outName, buffer);
  console.log('Done: ' + outName + ' (' + (buffer.length / 1024).toFixed(1) + ' KB)');
})();
