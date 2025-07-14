import React from 'react';
import { Card } from 'antd';

function StyledCard({ title, children, style, bodyStyle, ...rest }) {
  return (
    <Card
      title={title}
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        ...style,
      }}
      bodyStyle={{
        padding: 20,
        ...bodyStyle,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
}

export default StyledCard;
