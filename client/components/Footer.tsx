import { Link } from "react-router-dom";
import {
  Anchor,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
} from "lucide-react";

const Footer = () => {
  const platformLinks = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "Discover Ports" },
    { href: "/reservations", label: "My Reservations" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/mobile-app", label: "Mobile App" },
  ];

  const supportLinks = [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/safety", label: "Safety" },
    { href: "/cancellation", label: "Cancellation" },
    { href: "/trust-safety", label: "Trust & Safety" },
    { href: "/terms", label: "Terms of Service" },
  ];

  const companyLinks = [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/press", label: "Press" },
    { href: "/investors", label: "Investors" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/accessibility", label: "Accessibility" },
  ];

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="https://garbrix.com/navios/assets/images/logo.png"
                  alt="Dock Now"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">Dock Now</span>
            </Link>
            <p className="text-navy-300 mb-6 max-w-sm">
              The world's leading platform for discovering and reserving boat
              docking spaces. Trusted by boat owners and marina operators
              worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-navy-300">
                <Mail className="w-4 h-4" />
                <span>support@docknow.com</span>
              </div>
              <div className="flex items-center space-x-3 text-navy-300">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-navy-300">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-navy-300 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-navy-300 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-navy-300 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Language & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>

            {/* Language Selector */}
            <div className="mb-6">
              <button className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors duration-200">
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
              </button>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-navy-900 hover:bg-navy-800 rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-navy-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-navy-400 text-sm">
              © {new Date().getFullYear()} Dock Now. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-navy-400 hover:text-white transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-navy-400 hover:text-white transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-navy-400 hover:text-white transition-colors duration-200"
              >
                Cookies
              </Link>
              <Link
                to="/sitemap"
                className="text-navy-400 hover:text-white transition-colors duration-200"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
