import { Card, CardContent, Grid, Stack, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface LedgerSummaryProps {
  cards: { title: string; value: string; icon: LucideIcon; color: string }[];
}

export default function LedgerSummary({ cards }: LedgerSummaryProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Grid item xs={6} md={3} key={card.title}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Card sx={{ p: 1, borderRadius: 1.5, boxShadow: 'none', bgcolor: `${card.color}1a` }}>
                      <Icon size={20} color={card.color} />
                    </Card>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>{card.title}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>{card.value}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
}
