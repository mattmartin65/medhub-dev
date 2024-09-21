const MaxWidthContainer = ({ children }) => {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '736px' }}>
      {children}
    </div>
  );
};

export default MaxWidthContainer;
