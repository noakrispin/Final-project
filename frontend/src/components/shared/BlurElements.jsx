import React from 'react';

export const BlurElements = React.memo(() => (
  <>
    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#c8d7ff]/70 rounded-full blur-[50px]" />
    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#c8d7ff]/70 rounded-full blur-[40px]" />
  </>
));