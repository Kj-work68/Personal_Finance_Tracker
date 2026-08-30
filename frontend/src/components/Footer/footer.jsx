import React from "react";
import './footer.css'

export default function footer () {
    return(
        <footer className="main-footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Finance Tracker dev By Kachen.j </p>    
            </div>
        </footer>
    )
}