import { cn } from "cn";

type Props = {
  title: string;
  description?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  className?: string;
};

const TitleHeading = ({
  title,
  description,
  classNameTitle,
  classNameDescription,
  className,
}: Props) => {
  return (
    <div className={cn(className)}>
      <h1 className={cn("text-xl font-bold", classNameTitle)}> {title}</h1>
      <p
        className={cn(
          "mt-0.5 text-sm text-muted-foreground",
          classNameDescription,
        )}
      >
        {description}
      </p>
    </div>
  );
};

export default TitleHeading;
