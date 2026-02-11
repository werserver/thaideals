import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AiDescriptionProps {
  productName: string;
  categoryName: string;
  price: number;
  currency: string;
}

export function AiDescription({ productName, categoryName, price, currency }: AiDescriptionProps) {
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-description", {
        body: { productName, categoryName, price, currency },
      });
      if (error) throw error;
      if (data?.description) {
        setDescription(data.description);
        setHighlights(data.highlights || []);
        setGenerated(true);
      }
    } catch (err) {
      console.error("Failed to generate description:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!generated) {
    return (
      <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-5 text-center space-y-3 animate-fade-in">
        <Sparkles className="h-7 w-7 text-accent mx-auto" />
        <p className="font-medium text-foreground text-sm">สร้างคำอธิบายสินค้าด้วย AI</p>
        <Button variant="outline" size="sm" onClick={generate} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังสร้าง...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              สร้างคำอธิบาย
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">{description}</p>
      {highlights.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">จุดเด่นของสินค้า</p>
          <ul className="space-y-1.5">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
