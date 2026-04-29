const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Tools Hub</span>
          <p className="text-sm text-muted-foreground mt-2">Discover and compare the best AI tools.</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Tools Hub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
