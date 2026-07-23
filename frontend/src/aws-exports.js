const awsConfig = {
  Auth: {
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_cPDXNClGu',
    userPoolWebClientId: 'kubkbo5ehb5850ej5a5g9ilqu'
  }
};

const apiConfig = {
  apiGatewayBaseUrl: 'https://jw0yvet0t5.execute-api.ap-southeast-1.amazonaws.com/'
};

export default { ...awsConfig, ...apiConfig };
