const textDecoder = new TextDecoder('utf-8');

export const decodeAwsResponseBody = (body: any) => {
  const decodedResponseBody = JSON.parse(textDecoder.decode(body));

  return decodedResponseBody;
};
