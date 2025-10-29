import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Logo / Title */}
        <div className={styles.footerBrand}>
          <h3 className={styles.footerTitle}>🥗 DietPredict</h3>
          <p className={styles.tagline}>
            Your journey to better health starts here 🌟
          </p>
        </div>

        {/* Links */}
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>About Us</a>
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          <a href="#" className={styles.footerLink}>Terms of Service</a>
          <a href="#" className={styles.footerLink}>Contact</a>
          <a href="#" className={styles.footerLink}>FAQ</a>
        </div>

        {/* Social Icons */}
        <div className={styles.footerSocial}>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
          <a
            href="mailto:dietpredict@gmail.com"
            className={styles.socialLink}
            aria-label="Contact via Email"
          >
            <FaEnvelope />
          </a>
        </div>

        {/* Copyright */}
        <p className={styles.copyright}>
          © 2025 <strong>DietPredict</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
