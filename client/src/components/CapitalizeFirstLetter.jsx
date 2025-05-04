import React from 'react';

const CapitalizeFirstLetter = ({ text }) => {
    const formattedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    return <div>{formattedText}</div>;
};

export default CapitalizeFirstLetter;
