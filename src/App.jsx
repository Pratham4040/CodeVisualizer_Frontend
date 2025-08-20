import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const defaultCode = `# Character Frequency Counter
text = "hello"
counts = {}

for char in range(len(text)):
    if text[char] in counts:
        counts[text[char]] = counts[text[char]] + 1
    else:
        counts[text[char]] = 1
`;

function App() {
  const [code, setCode] = useState(defaultCode);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isVisualizing = steps.length > 0;
  const currentStep = isVisualizing ? steps[currentStepIndex] : null;

  const handleVisualize = async () => {
    setError(null);
    setSteps([]);
    setCurrentStepIndex(0);

    try {
      const response = await fetch('http://localhost:8000/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred');
      }

      const data = await response.json();
      setSteps(data.steps);

    } catch (err) {
      setError(err.message);
    }
  };
  
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    
    <div className="dark relative flex size-full min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold">CodeVizuvalizer</h2>
        </div>
      </header>
      <Card>
      {/* Main Content */}
      <div className="gap-1 px-6 flex flex-1 justify-center py-5">
        
        {/* Left Panel: Code and Controls */}
        <Card>
        <div className="flex flex-col max-w-[920px] flex-1">
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-base font-medium pb-2">Python Code</p>
              <div className="grid w-full gap-2">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button style={{ marginTop: '8px', backgroundColor: 'black', color: 'white' }} onClick={handleVisualize}>Run</Button>
              </div>
            </label>
          </div>
          <CardContent>
          {isVisualizing && (
            <>
              <p className="text-muted-foreground text-sm px-4">Step: {currentStepIndex + 1}/{steps.length}</p>
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
                <Button style={{ marginTop: '8px', backgroundColor: 'black', color: 'white' }}  onClick={goToPrevStep} disabled={currentStepIndex === 0} variant="secondary">Prev</Button>
                <Button style={{ marginTop: '8px', backgroundColor: 'black', color: 'white' }}  onClick={goToNextStep} disabled={currentStepIndex === steps.length - 1} variant="secondary">Next</Button>
              </div>
            </>
          )}
          </CardContent>
          {error && (
             <p className="text-destructive text-sm px-4 py-2">Error: {error}</p>
          )}

        </div>
        </Card>

        {/* Right Panel: Visualization */}
        <Card>
          <CardContent>
          <div className="flex flex-col w-[360px]">
            <CardContent>
            <div className="pb-3">
              <div className="flex border-b border-border px-4 gap-8">
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-primary pb-[13px] pt-4" href="#">
                  <p className="text-sm font-bold text-primary-foreground">Variables</p>
              </a>
            </div>
          </div>
          </CardContent>
          <CardContent>
          <div className="p-4 grid grid-cols-[auto_1fr] gap-x-6 text-sm">
            {isVisualizing && currentStep && Object.keys(currentStep.scope).length > 0 ? (
              Object.entries(currentStep.scope).map(([key, value]) => (
                <div key={key} className="col-span-2 grid grid-cols-subgrid border-t border-border py-3 items-center">
                  <p className="text-muted-foreground">{key}</p>
                  <p className="font-mono whitespace-pre-wrap">{JSON.stringify(value)}</p>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-muted-foreground italic">Run code to see variables</p>
            )}
          </div>
          </CardContent>
          
          {isVisualizing && currentStep && (
            <p className="text-muted-foreground text-sm px-4">Message: {currentStep.message}</p>
          )}
          
        </div>
        </CardContent>

        </Card>
      </div>
      </Card>
    </div>
    
  );
}

export default App;