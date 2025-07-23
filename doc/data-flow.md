# Sequence Diagrams and Data Flow

This document provides UML sequence diagrams for the main flows in the Secure File Sharing project, covering both backend and frontend interactions.

---

## 1. User Registration

```plantuml
@startuml
actor User
participant Frontend
participant Backend
participant Database

User -> Frontend: Fill registration form
Frontend -> Backend: POST /api/auth/register
Backend -> Database: Save user (first name, last name, email, password)
Database --> Backend: Success/Failure
Backend --> Frontend: Registration result
Frontend --> User: Show result
@enduml
```

---

## 2. User Login

```plantuml
@startuml
actor User
participant Frontend
participant Backend
participant Database

User -> Frontend: Enter email & password
Frontend -> Backend: POST /api/auth/login
Backend -> Database: Verify credentials
Database --> Backend: Valid/Invalid
Backend --> Frontend: JWT token or error
Frontend --> User: Show login result
@enduml
```

---

## 3. File Upload & Share

```plantuml
@startuml
actor User
participant Frontend
participant Backend
participant Database
participant EmailService

User -> Frontend: Fill upload form & select file
Frontend -> Backend: POST /api/file/upload (file, recipient email, password, expiration)
Backend -> Backend: Encrypt file
Backend -> Database: Save encrypted file & metadata
Database --> Backend: Success
Backend -> EmailService: Send notification to recipient
EmailService --> Backend: Email sent
Backend --> Frontend: Upload result
Frontend --> User: Show result
@enduml
```

---

## 4. File Download (Recipient)

```plantuml
@startuml
actor Recipient
participant Frontend
participant Backend
participant Database

Recipient -> Frontend: Request file list
Frontend -> Backend: GET /api/list/receive
Backend -> Database: Fetch shared files
Database --> Backend: File list
Backend --> Frontend: File list
Frontend --> Recipient: Show file list

Recipient -> Frontend: Click download, enter password
Frontend -> Backend: GET /api/file/retrieve (file id, password)
Backend -> Database: Fetch encrypted file
Database --> Backend: Encrypted file
Backend -> Backend: Decrypt file (if password matches)
Backend --> Frontend: File or error
Frontend --> Recipient: Download file or show error
@enduml
```

---

## 5. Update User Profile

```plantuml
@startuml
actor User
participant Frontend
participant Backend
participant Database

User -> Frontend: Edit profile (first name, last name)
Frontend -> Backend: PUT /api/users/name
Backend -> Database: Update user info
Database --> Backend: Success/Failure
Backend --> Frontend: Update result
Frontend --> User: Show result
@enduml
```

---

## 6. Change Password

```plantuml
@startuml
actor User
participant Frontend
participant Backend
participant Database

User -> Frontend: Enter new password
Frontend -> Backend: PUT /api/users/password
Backend -> Database: Update password (hashed)
Database --> Backend: Success/Failure
Backend --> Frontend: Update result
Frontend --> User: Show result
@enduml
```

---

## 7. File Listing (Send/Receive)

```plantuml
@startuml
actor User
participant Frontend
participant Backend
participant Database

User -> Frontend: Request sent/received file list
Frontend -> Backend: GET /api/list/send or /api/list/receive
Backend -> Database: Fetch file list
Database --> Backend: File list
Backend --> Frontend: File list
Frontend --> User: Show file list
@enduml
```

---

*End of Data Flow and Sequence Diagrams*
