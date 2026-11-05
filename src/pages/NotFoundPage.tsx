import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/usePageMeta";
export default function NotFoundPage() { usePageMeta("Page not found", "This page does not exist.", { noindex: true }); return <div className="container not-found"><p className="label">404 / lost in the network</p><h1>This path doesn't <span className="text-gradient">exist.</span></h1><p>The page may have moved, or the link may be incorrect.</p><Link to="/" className="btn btn--primary"><ArrowLeft size={16}/> Back home</Link></div>; }
