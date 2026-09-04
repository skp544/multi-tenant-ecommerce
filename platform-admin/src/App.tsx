import React from "react";
import { Button } from "./components/ui/button";

type Props = {};

const App = (props: Props) => {
  return (
    <div className="text-2xl text-red-500">
      Platform Admin
      <div>
        <Button>Click Me</Button>
      </div>
    </div>
  );
};

export default App;
