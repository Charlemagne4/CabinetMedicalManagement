import { useEffect } from "react";
import { Button } from "./ui/button";
import useIntersactionObserver from "@/hooks/useIntersactionObserver";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

function InfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isManual = false,
}: InfiniteScrollProps) {
  const { isIntersecting, targetRef } = useIntersactionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManual,
    fetchNextPage,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant={"secondary"}
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "load more"}
        </Button>
      ) : (
        <p className="text-muted-foreground text-xs">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
}

export default InfiniteScroll;
