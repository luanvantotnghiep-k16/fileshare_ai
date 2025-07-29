# Software Requirements Specification (SRS)

## Project Title: Secure File Sharing Backend

## Introduction
This document specifies the requirements for a backend system built with NestJS that enables users to securely upload, share, and manage files. The system ensures privacy and security by encrypting files before sharing them with other users via email.

## Purpose
The purpose of this backend is to provide a secure platform for file sharing, where users can upload files, encrypt them, and share access with other users through email notifications. The system aims to protect user data and facilitate easy, secure collaboration.

## Scope
- Backend API built with NestJS
- Secure file upload and storage
- File encryption and decryption
- Sharing files with other users via email
- User authentication and authorization

## Functional Requirements
1. **User Registration & Authentication**
   - Users can register a new account with the following fields: first name, last name, email, password, and confirm password.
   - Users can log in using email and password.
   - Authentication via JWT or OAuth2.

2. **File Upload**
   - Users can upload files to the server via an upload page with the following fields: id, file name, recipient email, expiration date, created at, and an upload button.
   - When the user clicks the upload button, a dialog form appears allowing input of recipient email, password to encrypt, expiration date, and file upload.
   - Uploaded files are encrypted before storage.

3. **File Storage**
   - Encrypted files are stored securely.
   - Metadata (filename, owner, upload date) is maintained.

4. **File Sharing**
   - Users can share files with other users by specifying their email addresses.
   - Shared users receive an email notification with a secure link to access the file.
   - Only authorized users can decrypt and download shared files.
   - Recipient files page displays: id, file name, recipient email, expiration date, created at, and actions (download).
   - When the user clicks download, a form appears to input the password. If the password matches the file's password, the file is downloaded; otherwise, an error is displayed.

5. **File Download**
   - Users can download files they own or that have been shared with them.
   - Files are decrypted upon download for authorized users.

6. **Audit & Logging**
   - Actions such as upload, share, download are logged for security and auditing.
7. **User Profile Management**
   - User profile page displays: email, first name, last name, and a button to update first name and last name.
   - Another panel displays input for password and a button to change password.

## Non-Functional Requirements
- **Security**: All files are encrypted using strong algorithms (e.g., AES-256). Secure authentication and authorization mechanisms are enforced.
- **Performance**: The system should handle concurrent uploads and downloads efficiently.
- **Scalability**: Designed to support a growing number of users and files.
- **Reliability**: High availability and fault tolerance.
- **Usability**: Clear API documentation and error messages.

## System Architecture
- **NestJS Backend**: RESTful API endpoints for all operations.
- **Database**: Stores user data, file metadata, and sharing permissions.
- **File Storage**: Local or cloud storage for encrypted files.
- **Email Service**: Integration with an SMTP provider for notifications.
- **Encryption Service**: Handles file encryption and decryption.

## Assumptions & Constraints
- Users must have valid email addresses.
- File size limits may apply based on storage and performance considerations.
- Only authorized users can access shared files.

## Future Enhancements
- Support for group sharing and access control lists.
- Integration with third-party cloud storage providers.
- Advanced audit and reporting features.

## Glossary
- **Encryption**: The process of converting data into a secure format.
- **JWT**: JSON Web Token, used for authentication.
- **NestJS**: A progressive Node.js framework for building efficient server-side applications.
*End of SRS Document*

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **MongoDB**: NoSQL database used for storing user, file, and sharing data. Runs on port 27032.
- **Passport**: Popular Node.js authentication library for handling user authentication.
- **bcrypt**: Password hashing library for secure user authentication.
- **jsonwebtoken**: Library for encoding and decoding JWT tokens.
- **dotenv**: To manage environment variables securely.

## API Endpoints

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login a user and return a JWT token.
- `GET /api/users/me`: Retrieve the authenticated user's information.
- `PUT /api/users/name`: Update the authenticated user's name.
- `PUT /api/users/password`: Change the authenticated user's password.
- `GET /api/users/search-emails`: Search for users by their email addresses.
- `POST /api/file/upload`: Upload a file (requires authentication).
- `GET /api/file/retrieve`: Retrieve an uploaded file by ID (requires authentication).
- `POST /api/list/send`: Send a list of files to another user.
- `GET /api/list/receive`: Retrieve the list of files received from another user.

## Backend Environment Configuration

Create a `.env` file in the backend directory with the following example content:

```
MONGODB_URI=mongodb://localhost:27032/source_ai
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

## Frontend Specification

### Overview
The frontend for the file sharing project is built using Next.js, with authentication handled by Auth.js and UI components provided by ShadCN.
### Features

#### File Upload

- Upload page displays a table of user uploads with columns for:
  - ID
  - File name
  - Recipient email
  - Expiration date
  - Created at

- Empty-state UI shows “No results” when no uploads exist.

- “Share File” button opens a modal form containing:
  - Recipient email input
  - Encryption password and confirm password fields
  - Expiration date picker
  - File selector supporting drag-and-drop or conventional file dialog

- Client-side validation for email format, password strength, and expiration constraints.

- Real-time upload progress bar and toast notifications for success or failure.

#### Received Files

- Page lists files shared with the current user, showing:
  - ID
  - File name
  - Sender email
  - Expiration date
  - Received at

- Download action launches a password prompt modal.

- Inline error messages for decryption failures.

#### User Profile Management

- Profile page displays:
  - Email
  - First name
  - Last name

- Inline form to update first name and last name with immediate validation feedback.

- Change password panel requiring:
  - Current password
  - New password
  - Confirmation
  - Strength indicator and validation

#### UI/UX & Accessibility

- Responsive layouts optimized for desktop, tablet, and mobile.

- Consistent styling with ShadCN components and Tailwind CSS.

- Keyboard-navigable modals and forms, with ARIA attributes for screen readers.

- Clear, contextual error messages and form hints to guide users.


### Technologies Used
- **Next.js 15**: The React framework for building fast and scalable applications with server-side rendering and static site generation.
- **Auth.js**: Authentication solution to handle secure login and user sessions.
- **ShadCN**: A customizable and consistent UI component library built on Radix and Tailwind CSS for creating beautiful UIs quickly.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **TypeScript**: Superset of JavaScript that provides static typing, ensuring a robust and scalable codebase.



---

### fileshare.code-workspace

Update your workspace file to include the three main folders:

```json
{
  "folders": [
    {
      "path": "backend"
    },
    {
      "path": "frontend"
    },
    {
      "path": "doc"
    }
  ],
  "settings": {
    // your workspace-level settings go here
  }
}
