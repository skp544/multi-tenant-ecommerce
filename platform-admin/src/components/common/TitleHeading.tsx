type Props = {
  title: string;
  description?: string;
};

const TitleHeading = ({ title, description }: Props) => {
  return (
    <div>
      <h1 className="text-xl font-bold"> {title}</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default TitleHeading;
