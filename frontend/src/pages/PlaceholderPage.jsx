import { Card } from '../components/ui';

export const PlaceholderPage = ({ title, description }) => <div className="mx-auto max-w-7xl"><h1 className="text-h1 text-ink">{title}</h1><Card className="mt-6"><p className="text-body text-text-secondary">{description}</p></Card></div>;