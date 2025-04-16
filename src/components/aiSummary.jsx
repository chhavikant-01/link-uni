import { useState } from "react"
import { Sparkles, X } from "lucide-react"
import { Button } from "../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../components/ui/dialog"
import ReactMarkdown from "react-markdown"

export default function AISummaryButton({
  documentId,
  documentTitle,
  hasSummary,
  summary: initialSummary,
  onGenerateSummary,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [summary, setSummary] = useState(initialSummary || "")
  const [isLoading, setIsLoading] = useState(false)

  // Don't render the button if no summary is available and no generation function is provided
  if (!hasSummary && !onGenerateSummary) return null

  const handleOpenSummary = async () => {
    setIsOpen(true)

    // If we don't have a summary yet but can generate one, do so
    if (!summary && onGenerateSummary) {
      try {
        setIsLoading(true)
        const generatedSummary = await onGenerateSummary(documentId)
        setSummary(generatedSummary)
      } catch (error) {
        console.error("Failed to generate summary:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <Button
        onClick={handleOpenSummary}
        variant="outline"
        className="bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 border-blue-500/20 transition-all group relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Summary
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity animate-shimmer"></span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
              AI Summary
            </DialogTitle>
            <DialogDescription>AI-generated summary of "{documentTitle}"</DialogDescription>
          </DialogHeader>

          <DialogClose className="absolute right-4 top-4 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Generating summary...</p>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-blue-500/50 pl-4 italic my-4" {...props} />
                    ),
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code className="bg-blue-500/10 px-1 py-0.5 rounded text-sm" {...props} />
                      ) : (
                        <code className="block bg-blue-500/10 p-3 rounded-md text-sm overflow-x-auto my-4" {...props} />
                      ),
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
