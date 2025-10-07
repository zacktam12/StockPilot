import React, { useState, useMemo } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Package,
  User,
  AlertTriangle,
  BarChart3,
  X
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import Button from "../../../components/shared/Button";
import StatusBadge from "../../../components/shared/StatusBadge";
// Using CSS animations instead of framer-motion

const AdvancedReportTable = ({ report, data, onSort }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [visibleColumns, setVisibleColumns] = useState(new Set(report?.columns || []));
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredData, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    onSort(field, sortOrder);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const toggleColumn = (column) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(column)) {
      newVisible.delete(column);
    } else {
      newVisible.add(column);
    }
    setVisibleColumns(newVisible);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map((_, index) => index)));
    }
  };

  const toggleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const getCellValue = (item, column) => {
    switch (column) {
      case "Date":
        return format(new Date(item.created_at || item.date), "MMM dd, yyyy");
      case "Order ID":
        return item.order_id || item.id || "N/A";
      case "Amount":
      case "Price":
      case "Total Value":
      case "Revenue":
      case "Total Revenue":
        return `$${Number(item.revenue || item.total_revenue || item.total_amount || item.price || item.total_value || item.total || 0).toFixed(2)}`;
      case "Status":
        return (
          <StatusBadge 
            variant={
              // Order/Transaction statuses
              item.status === "completed" ? "success" :
              item.status === "pending" ? "warning" :
              item.status === "cancelled" ? "danger" :
              // Inventory/Stock statuses
              item.status === "In Stock" ? "success" :
              item.status === "Low Stock" ? "warning" :
              item.status === "Critical" ? "danger" :
              item.status === "Out of Stock" ? "danger" : "default"
            }
          >
            {item.status}
          </StatusBadge>
        );
      case "Customer":
        return item.customer?.name || item.customer_name || "Unknown";
      case "Supplier":
        return item.supplier_name || "Unknown";
      case "Product Name":
        return item.name || item.product_name || "Unknown";
      case "Category":
        return item.category_name || item.category || "Uncategorized";
      case "Quantity":
        return item.quantity?.toString() || "0";
      case "Units Sold":
        return item.total_sold?.toString() || "0";
      case "Growth %":
        return `${item.growth || 0}%`;
      case "Payment Method":
        return item.payment_method || "Cash";
      case "Month":
        return item.month || "N/A";
      case "Orders Count":
        return item.orders_count?.toString() || "0";
      case "Last Updated":
        return item.last_updated ? format(new Date(item.last_updated), "MMM dd, yyyy") : "N/A";
      case "Unit Price":
        return `$${Number(item.unit_price || item.price || 0).toFixed(2)}`;
      case "Urgency":
        return (
          <StatusBadge 
            variant={
              item.urgency === "Critical" ? "danger" :
              item.urgency === "High" ? "warning" :
              item.urgency === "Medium" ? "info" : "default"
            }
          >
            {item.urgency}
          </StatusBadge>
        );
      case "Expected Delivery":
        return item.expected_delivery ? format(new Date(item.expected_delivery), "MMM dd, yyyy") : "N/A";
      case "Order Number":
        return item.order_number || item.id || "N/A";
      case "Product Count":
        return item.product_count?.toString() || "0";
      case "Supplier Contact":
        return item.supplier_contact || "N/A";
      case "Average Order Value":
        return `$${Number(item.average_order_value || 0).toFixed(2)}`;
      case "Last Order Date":
        return item.last_order_date ? format(new Date(item.last_order_date), "MMM dd, yyyy") : "N/A";
      case "Total Purchased":
        return item.total_purchased?.toString() || "0";
      case "Total Cost":
        return `$${Number(item.total_cost || 0).toFixed(2)}`;
      case "Avg Cost":
        return `$${Number(item.avg_cost || 0).toFixed(2)}`;
      case "Trend":
        return (
          <StatusBadge 
            variant={
              item.trend === "Increasing" ? "danger" :
              item.trend === "Decreasing" ? "success" :
              item.trend === "Stable" ? "info" : "default"
            }
          >
            {item.trend}
          </StatusBadge>
        );
      default:
        return item[column.toLowerCase().replace(/\s+/g, '_')] || "N/A";
    }
  };

  const getColumnIcon = (column) => {
    switch (column) {
      case "Date":
        return <Calendar size={14} />;
      case "Amount":
      case "Price":
      case "Total Value":
      case "Total Revenue":
        return <DollarSign size={14} />;
      case "Product Name":
      case "Category":
        return <Package size={14} />;
      case "Customer":
      case "Supplier":
        return <User size={14} />;
      case "Status":
        return <AlertTriangle size={14} />;
      default:
        return null;
    }
  };

  const exportData = () => {
    const csvContent = [
      report.columns.join(","),
      ...sortedData.map(item => 
        report.columns.map(column => {
          const value = getCellValue(item, column);
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  if (!report || !data) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="truncate">{report.title}</span>
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial sm:min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Column Selector */}
                <div className="relative flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    <span className="hidden sm:inline">Columns</span>
                    <span className="sm:hidden">Cols</span>
                  </Button>

                  {showColumnSelector && (
                    <>
                      <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setShowColumnSelector(false)} />
                      <div className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 w-full sm:w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999]">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Visible Columns</h3>
                            <button
                              onClick={() => setShowColumnSelector(false)}
                              className="sm:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <X size={16} className="text-gray-500" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {report.columns.map((column) => (
                              <label key={column} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                <input
                                  type="checkbox"
                                  checked={visibleColumns.has(column)}
                                  onChange={() => toggleColumn(column)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{column}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Export */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-[800px] w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {report.columns.map((column) => {
                    if (!visibleColumns.has(column)) return null;
                    return (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort(column.toLowerCase().replace(/\s+/g, '_'))}
                      >
                        <div className="flex items-center gap-2">
                          {getColumnIcon(column)}
                          <span>{column}</span>
                          {getSortIcon(column.toLowerCase().replace(/\s+/g, '_'))}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedData.map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 animate-fade-in ${
                      selectedRows.has(index) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => toggleSelectRow(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {report.columns.map((column) => {
                      if (!visibleColumns.has(column)) return null;
                      return (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getCellValue(item, column)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>Showing {sortedData.length} of {data.length} records</span>
              {selectedRows.size > 0 && (
                <span className="text-blue-600 dark:text-blue-400">
                  {selectedRows.size} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Sort by: {sortField || 'None'}</span>
              <span>Order: {sortOrder}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReportTable;
