import { Link } from "react-router-dom";

// Shown if a page crashes, instead of the default developer error screen.
export default function ErrorPage() {
  return (
    <main className="container not-found">
      <p className="label">Something went wrong</p>
      <h1>This page hit an <span className="text-gradient">error.</span></h1>
      <p>Please try again, or return to the home page.</p>
      <Link to="/" className="btn btn--primary">Back home</Link>
    </main>
  );
}
