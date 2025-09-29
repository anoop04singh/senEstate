import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 text-center text-sm text-muted-foreground">
      <p>
        Built and managed with love by 0xanoop, powered by{' '}
        <a href="https://sensay.io/" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary underline">
          Sensay
        </a>.
      </p>
    </footer>
  );
};

export default Footer;