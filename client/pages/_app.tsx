import '../styles/globals.css';
import type { AppProps } from 'next/app';
import type { GetServerSideProps } from 'next';
import { buildClient } from '../api-utils/build-client';
import { Currentuser } from '../common-types/currentuser';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

interface ServerSidePropsReturnType {
  currentuser: Currentuser;
}

// this will never run on the browser
export const getServerSideProps: GetServerSideProps<
  ServerSidePropsReturnType
> = async context => {
  const client = buildClient(context.req);

  const res = await client.get('/api/users/currentuser').catch(err => {
    console.log(err.message);
  });

  return {
    props: {
      currentuser: (res && res.data) || null,
    },
  };
};
