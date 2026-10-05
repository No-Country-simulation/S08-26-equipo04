import { Helmet } from 'react-helmet-async';

export const Title = ({ children }) => (
  <Helmet>
    <title>{children ? `${children} | QualityTrack` : 'QualityTrack'}</title>
  </Helmet>
);
