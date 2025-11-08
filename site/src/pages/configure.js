import React from 'react';
import Layout from '@theme/Layout';
import configureHtml from '!!raw-loader!../../static/ConfigureBusyTime.html';

export default function Configure() {
  return (
    <Layout title="Configure BusyTime">
      <div className="container margin-vert--lg">
        <div dangerouslySetInnerHTML={{__html: configureHtml}} />
      </div>
    </Layout>
  );
}