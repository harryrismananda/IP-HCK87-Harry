

export const Footer = () => {
  return (
    <footer className="bg-base-300 text-base-content">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-primary mb-2">BiblioLex</h3>
            <p className="text-sm text-base-content/70">
              Master languages with AI-powered learning
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2">
              <div>
                <a href="/" className="text-sm hover:text-primary transition-colors">
                  Home
                </a>
              </div>
              <div>
                <a href="/courses" className="text-sm hover:text-primary transition-colors">
                  Courses
                </a>
              </div>
              <div>
                <a href="/profile" className="text-sm hover:text-primary transition-colors">
                  Profile
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-base-content/70">
              <div>support@bibliolex.com</div>
              <div>Learning made simple</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-base-content/60">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2025 BiblioLex. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
