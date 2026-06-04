import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandableDescriptionProps {
  description: string;
}

export function ExpandableDescription({
  description,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const LINE_HEIGHT = 24;
  const MAX_LINES = 5;
  const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES;
  4;
  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        setShowButton(contentRef.current.scrollHeight > MAX_HEIGHT);
      }
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, [description]);

  return (
    <div className="relative">
      <strong className="block mb-2">Description:</strong>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${
          !isExpanded && showButton ? "max-h-[275px]" : ""
        }`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: description,
          }}
          className="prose prose-sm max-w-none whitespace-pre-wrap"
        />
      </div>

      {showButton && (
        <div
          className={`${
            !isExpanded
              ? "absolute bottom-0 left-0 right-0 pt-8 pb-2 bg-gradient-to-t from-white via-white to-transparent"
              : "mt-2"
          }`}
        >
          <div className="flex justify-center">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 font-medium"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
