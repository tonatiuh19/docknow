import Link from "next/link";
import { FaAnchor } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16 px-4 border-t border-navy-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaAnchor className="h-8 w-8 text-ocean-400" />
              <span className="text-2xl font-bold">DockNow</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Making boating accessible worldwide. Find and book marina slips
              with ease.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/help"
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">For Marinas</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/list-your-marina"
                  className="hover:text-white transition-colors"
                >
                  List Your Marina
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-white transition-colors"
                >
                  Marina Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; 2025 DockNow LLC. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
