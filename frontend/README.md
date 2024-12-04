
# Instructions for Pulling and Running the Project

## Prerequisites

Ensure the following are installed on your system:

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (bundled with Node.js)
- A code editor like [Visual Studio Code](https://code.visualstudio.com/)

---

## Pulling the Project from GitHub

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the project.
3. Run the following command to clone the repository:

   ```bash
   git clone https://github.com/noakrispin/Final-project.git
   ```

4. Navigate into the project directory:

   ```bash
   cd Final-project
   ```

---

## Installing Dependencies

1. Install all necessary dependencies by running the following command in the root project directory:

   ```bash
   npm install
   ```

   This will install dependencies for both the frontend and backend.

---

## Running the Project

1. Start both the frontend and backend simultaneously by running:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the following URLs:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

1. Ensure Node.js and npm are installed correctly:
   - Check Node.js version:
     ```bash
     node -v
     ```
   - Check npm version:
     ```bash
     npm -v
     ```

2. If you encounter issues, ensure all dependencies are installed using:

   ```bash
   npm install
   ```

3. Verify that ports 5173 (frontend) and 3000 (backend) are available.
