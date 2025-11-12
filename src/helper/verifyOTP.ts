import { TOKENS } from '~/config';

const { TWO_FA_KEY, TWO_FA_URL } = TOKENS;

export const verifyExamCode = async (token: string) => {
  try {
    const response = await fetch(TWO_FA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, secret: TWO_FA_KEY }),
    });

    const data = await response.json();

    return data.verified;
  } catch (error) {
    console.error('Error verifying exam code:', error);
    return false;
  }
};
