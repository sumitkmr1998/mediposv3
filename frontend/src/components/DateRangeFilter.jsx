import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Calendar, ChevronDown, X } from "lucide-react";

const DateRangeFilter = ({ 
  onFilterChange, 
  showFilter, 
  setShowFilter, 
  currentFilter 
}) => {
  const [selectedRange, setSelectedRange] = React.useState(currentFilter?.type || "all");
  const [customStartDate, setCustomStartDate] = React.useState(currentFilter?.startDate || "");
  const [customEndDate, setCustomEndDate] = React.useState(currentFilter?.endDate || "");

  const getDateRange = (type) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case "today":
        return {
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case "yesterday": {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          startDate: yesterday,
          endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      }
      case "this_week": {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        return {
          startDate: startOfWeek,
          endDate: endOfWeek
        };
      }
      case "custom":
        return {
          startDate: customStartDate ? new Date(customStartDate) : null,
          endDate: customEndDate ? new Date(customEndDate + "T23:59:59") : null
        };
      default:
        return null;
    }
  };

  const handleRangeChange = (type) => {
    setSelectedRange(type);
    const range = getDateRange(type);
    onFilterChange({
      type,
      ...range,
      startDate: range?.startDate?.toISOString().split('T')[0],
      endDate: range?.endDate?.toISOString().split('T')[0]
    });
  };

  const handleCustomDateChange = () => {
    if (customStartDate || customEndDate) {
      const range = getDateRange("custom");
      onFilterChange({
        type: "custom",
        ...range,
        startDate: customStartDate,
        endDate: customEndDate
      });
    }
  };

  const clearFilter = () => {
    setSelectedRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
    onFilterChange(null);
  };

  const getFilterLabel = () => {
    switch (selectedRange) {
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "this_week": return "This Week";
      case "custom": 
        if (customStartDate && customEndDate) {
          return `${customStartDate} to ${customEndDate}`;
        } else if (customStartDate) {
          return `From ${customStartDate}`;
        } else if (customEndDate) {
          return `Until ${customEndDate}`;
        }
        return "Custom Range";
      default: return "All Records";
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center space-x-2"
      >
        <Calendar className="h-4 w-4" />
        <span>{getFilterLabel()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
      </Button>

      {showFilter && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Filter by Date Range</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilter(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedRange === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRangeChange("today")}
                  className="text-sm"
                >
                  Today
                </Button>
                <Button
                  variant={selectedRange === "yesterday" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRangeChange("yesterday")}
                  className="text-sm"
                >
                  Yesterday
                </Button>
              </div>

              <Button
                variant={selectedRange === "this_week" ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeChange("this_week")}
                className="w-full text-sm"
              >
                This Week
              </Button>

              <div className="border-t pt-3">
                <Label className="text-sm font-medium">Custom Range</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setSelectedRange("custom");
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setSelectedRange("custom");
                      }}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCustomDateChange}
                    className="w-full text-sm"
                    disabled={!customStartDate && !customEndDate}
                  >
                    Apply Custom Range
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="w-full text-sm"
                >
                  Show All Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DateRangeFilter;