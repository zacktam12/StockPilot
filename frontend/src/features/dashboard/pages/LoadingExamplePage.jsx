import { useState, useEffect } from "react";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";

const LoadingExamplePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContainer
      isLoading={isLoading}
      title="Products"
      description="Loading available products..."
    >
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Content Loaded</h1>
        <p>This is the content that appears after the loading overlay.</p>
        <Card>
          <CardHeader>
            <CardTitle>Example Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Here is some more content inside a card to demonstrate the layout.
            </p>
          </CardContent>
        </Card>
      </div>
    </LoadingContainer>
  );
};

export default LoadingExamplePage;
