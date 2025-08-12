# Legal AI Assistant

This is a Next.js application that provides a personal dashboard for legal professionals, integrating with Google Calendar and Gmail to display events and emails.

## Prerequisites

- Node.js (v18 or later)
- npm

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hdeshpandeOpenLaw/paralegal.git
    cd paralegal
    ```

2.  **Install dependencies:**
    The `package.json` file contains all the necessary dependencies. Install them using npm:
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following environment variables. You can get these values from your Google Cloud Console.

    ```
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    NEXTAUTH_SECRET=a_random_secret_string_for_nextauth
    ```
    *Note: The `.env.local` file is included in `.gitignore` and will not be committed to the repository.*

## Running the Application

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
