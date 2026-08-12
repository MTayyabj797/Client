import { Card, Skeleton, Stack } from '@mui/material';

export default function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ transform: 'none', borderBottom: 1, borderColor: 'divider' }} />
        ))}
      </Card>
    </Stack>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ flex: '1 1 220px', p: 2.5 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" height={32} width="80%" />
        </Card>
      ))}
    </Stack>
  );
}
