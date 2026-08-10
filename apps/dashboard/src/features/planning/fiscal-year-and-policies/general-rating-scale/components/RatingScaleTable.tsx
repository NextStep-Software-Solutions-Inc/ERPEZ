import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RatingScaleItem } from '@/lib/fiscal-year-and-policies/types';
import { formatRatingRange } from '@/lib/fiscal-year-and-policies/ratingScaleValidator';

interface RatingScaleTableProps {
  ratingScale: RatingScaleItem[];
  displayFormat: 'decimal' | 'percentage';
  onEditClick: (rating: RatingScaleItem) => void;
}

export default function RatingScaleTable({
  ratingScale,
  displayFormat,
  onEditClick,
}: RatingScaleTableProps) {
  const sortedRatings = [...ratingScale].sort((a, b) => b.min - a.min);

  return (
    <div className="space-y-4">

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Adjectival Rating Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Range</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRatings.length > 0 ? (
            sortedRatings.map((rating) => (
              <TableRow key={rating.id}>
                <TableCell className="font-medium">{rating.label}</TableCell>
                <TableCell>{rating.description}</TableCell>
                <TableCell>{formatRatingRange(rating.min, rating.max, displayFormat)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditClick(rating)}
                    aria-label={`Edit rating ${rating.label}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                No ratings defined. Click "Add Rating" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
