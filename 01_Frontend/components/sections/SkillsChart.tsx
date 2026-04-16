"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  LabelList,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Skill {
  name: string | null;
  category: string | null;
  proficiency: string | null;
  percentage: number | null;
  yearsOfExperience: number | null;
  color: string | null;
}

interface SkillsChartProps {
  skills: Skill[];
}

export function SkillsChart({ skills }: SkillsChartProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  const groupedSkills = new Map<string, Skill[]>();

  for (const skill of skills) {
    const category = skill.category || "other";
    const existing = groupedSkills.get(category) || [];
    groupedSkills.set(category, [...existing, skill]);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {Array.from(groupedSkills.entries()).map(([category, categorySkills]) => {
        if (!categorySkills || categorySkills.length === 0) return null;

        const displayLabel = category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const chartData = categorySkills.map((skill) => ({
          name: skill.name || "Unknown",
          proficiency: skill.percentage || 0,
          color: skill.color || "hsl(var(--primary))",
        }));

        const chartConfig = {
          proficiency: {
            label: "Proficiency",
          },
        } satisfies ChartConfig;

        const chartHeight = categorySkills.length * 45 + 20;

        return (
          <motion.div
            key={category}
            variants={itemVariants}
            className="group relative rounded-2xl border bg-card/50 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30"
          >
            {/* Glossy Header */}
            <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {displayLabel}
              </h3>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {categorySkills.length} Skills
                </span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="p-6">
              <ChartContainer
                id={`skills-chart-${category}`}
                config={chartConfig}
                className="w-full aspect-auto min-w-0"
                style={{ 
                  height: `${chartHeight}px`,
                  minHeight: `${chartHeight}px`
                }}
              >
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: -10, right: 40, top: 10, bottom: 10 }}
                    barGap={12}
                  >
                    <XAxis
                      type="number"
                      hide
                      domain={[0, 100]}
                      tick={{ fill: "currentColor" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={110} // Increased width for labels
                      className="text-[13px] font-medium fill-foreground"
                      tick={{ fill: "currentColor" }}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(var(--primary), 0.05)", radius: 4 }}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="proficiency"
                      radius={[0, 10, 10, 0]}
                      barSize={20}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={`cell-${category}-${entry.name}`}
                          fill={entry.color}
                          className="transition-all duration-300 filter group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                        />
                      ))}
                      <LabelList
                        dataKey="proficiency"
                        position="right"
                        offset={12}
                        className="fill-foreground text-xs"
                        formatter={(val: any) => `${val}%`}
                        fill="currentColor"
                      />
                    </Bar>
                  </BarChart>
              </ChartContainer>
            </div>

            {/* Bottom Glow Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
