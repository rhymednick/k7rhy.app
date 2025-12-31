import React from 'react';
import { Guitar } from '@/types/product';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface GuitarPurchaseProps {
    guitar: Guitar;
}

export function GuitarPurchase({ guitar }: GuitarPurchaseProps) {
    if (!guitar.price && !guitar.purchaseLink) {
        return null;
    }

    return (
        <div className="flex items-center gap-4">
            {guitar.price && <span className="text-2xl font-bold">${guitar.price.toLocaleString()}</span>}
            {guitar.purchaseLink && (
                <Button asChild variant="default">
                    <Link target="_blank" href={guitar.purchaseLink}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Buy Now
                    </Link>
                </Button>
            )}
        </div>
    );
}
