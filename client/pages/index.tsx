import type { NextPage } from 'next';
import Head from 'next/head';
import { Currentuser } from '../common-types/currentuser';

interface HomePageProps {
  currentuser: Currentuser;
}

const Home: NextPage<HomePageProps> = ({ currentuser }) => {
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <h1>{currentuser ? 'You are logged in' : 'You are logged out'}</h1>
      <div>{JSON.stringify(currentuser)}</div>
    </div>
  );
};

export default Home;
