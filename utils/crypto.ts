
export const generateOrbitKey = async (username: string, password: string): Promise<string> => {
  const data = `${username}:${password}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const downloadKey = (username: string, key: string) => {
  const element = document.createElement("a");
  const file = new Blob([key], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${username}-orbit-key.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
