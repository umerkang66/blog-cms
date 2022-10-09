import { AppContext } from 'next/app';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';

export function buildClient(req: GetServerSidePropsContext['req']) {
  if (typeof window === 'undefined') {
    // next server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req?.headers,
    });
  }

  // client
  return axios.create({
    baseURL: '/',
  });
}
