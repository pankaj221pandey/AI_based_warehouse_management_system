import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd
import json
import os
import logging
from datetime import datetime
import re

class SKUMapper:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("WMS SKU Mapper")
        self.root.geometry("1200x800")
        
        # Data storage
        self.sales_data = None
        self.mappings = {}
        self.loaded_mappings = {}
        
        # Setup logging
        self.setup_logging()
        
        # Create GUI
        self.create_widgets()
        self.load_existing_mappings()
        
    def setup_logging(self):
        """Setup logging for the mapping process"""
        logging.basicConfig(
            filename='sku_mapping.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
    def create_widgets(self):
        """Create the main GUI widgets"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Warehouse Management System - SKU Mapper", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # File upload section
        self.create_file_upload_section(main_frame)
        
        # Mapping section
        self.create_mapping_section(main_frame)
        
        # Preview section
        self.create_preview_section(main_frame)
        
        # Control buttons
        self.create_control_buttons(main_frame)
        
    def create_file_upload_section(self, parent):
        """Create file upload section"""
        upload_frame = ttk.LabelFrame(parent, text="Data Upload", padding="10")
        upload_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Upload button
        self.upload_btn = ttk.Button(upload_frame, text="Upload Sales Data CSV", 
                                    command=self.upload_file)
        self.upload_btn.grid(row=0, column=0, padx=(0, 10))
        
        # File label
        self.file_label = ttk.Label(upload_frame, text="No file selected")
        self.file_label.grid(row=0, column=1, sticky=tk.W)
        
        # Auto-map button
        self.auto_map_btn = ttk.Button(upload_frame, text="Auto-Map SKUs", 
                                      command=self.auto_map_skus, state=tk.DISABLED)
        self.auto_map_btn.grid(row=0, column=2, padx=(10, 0))
        
    def create_mapping_section(self, parent):
        """Create SKU mapping section"""
        mapping_frame = ttk.LabelFrame(parent, text="SKU to MSKU Mapping", padding="10")
        mapping_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        
        # Left panel - SKU list
        left_panel = ttk.Frame(mapping_frame)
        left_panel.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        ttk.Label(left_panel, text="Available SKUs:").grid(row=0, column=0, sticky=tk.W)
        
        # SKU listbox with scrollbar
        sku_frame = ttk.Frame(left_panel)
        sku_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.sku_listbox = tk.Listbox(sku_frame, height=15, width=30)
        sku_scrollbar = ttk.Scrollbar(sku_frame, orient=tk.VERTICAL, command=self.sku_listbox.yview)
        self.sku_listbox.configure(yscrollcommand=sku_scrollbar.set)
        
        self.sku_listbox.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        sku_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Bind selection event
        self.sku_listbox.bind('<<ListboxSelect>>', self.on_sku_select)
        
        # Right panel - Mapping details
        right_panel = ttk.Frame(mapping_frame)
        right_panel.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        ttk.Label(right_panel, text="Mapping Details:").grid(row=0, column=0, sticky=tk.W)
        
        # SKU display
        ttk.Label(right_panel, text="SKU:").grid(row=1, column=0, sticky=tk.W, pady=(10, 0))
        self.sku_var = tk.StringVar()
        self.sku_entry = ttk.Entry(right_panel, textvariable=self.sku_var, state=tk.READONLY, width=30)
        self.sku_entry.grid(row=1, column=1, sticky=tk.W, pady=(10, 0), padx=(10, 0))
        
        # MSKU input
        ttk.Label(right_panel, text="MSKU:").grid(row=2, column=0, sticky=tk.W, pady=(10, 0))
        self.msku_var = tk.StringVar()
        self.msku_entry = ttk.Entry(right_panel, textvariable=self.msku_var, width=30)
        self.msku_entry.grid(row=2, column=1, sticky=tk.W, pady=(10, 0), padx=(10, 0))
        
        # Marketplace input
        ttk.Label(right_panel, text="Marketplace:").grid(row=3, column=0, sticky=tk.W, pady=(10, 0))
        self.marketplace_var = tk.StringVar()
        self.marketplace_combo = ttk.Combobox(right_panel, textvariable=self.marketplace_var, 
                                             values=["Amazon", "eBay", "Shopify", "WooCommerce", "Other"])
        self.marketplace_combo.grid(row=3, column=1, sticky=tk.W, pady=(10, 0), padx=(10, 0))
        
        # Buttons
        button_frame = ttk.Frame(right_panel)
        button_frame.grid(row=4, column=0, columnspan=2, pady=(20, 0))
        
        self.save_btn = ttk.Button(button_frame, text="Save Mapping", command=self.save_mapping)
        self.save_btn.grid(row=0, column=0, padx=(0, 10))
        
        self.clear_btn = ttk.Button(button_frame, text="Clear", command=self.clear_mapping)
        self.clear_btn.grid(row=0, column=1, padx=(0, 10))
        
        self.delete_btn = ttk.Button(button_frame, text="Delete Mapping", command=self.delete_mapping)
        self.delete_btn.grid(row=0, column=2)
        
        # Configure weights
        mapping_frame.columnconfigure(1, weight=1)
        mapping_frame.rowconfigure(0, weight=1)
        left_panel.columnconfigure(0, weight=1)
        left_panel.rowconfigure(1, weight=1)
        right_panel.columnconfigure(1, weight=1)
        
    def create_preview_section(self, parent):
        """Create data preview section"""
        preview_frame = ttk.LabelFrame(parent, text="Data Preview", padding="10")
        preview_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        
        # Treeview for data preview
        self.preview_tree = ttk.Treeview(preview_frame, columns=("SKU", "MSKU", "Name", "Quantity", "Revenue"), 
                                        show="headings", height=8)
        
        # Configure columns
        self.preview_tree.heading("SKU", text="SKU")
        self.preview_tree.heading("MSKU", text="MSKU")
        self.preview_tree.heading("Name", text="Product Name")
        self.preview_tree.heading("Quantity", text="Quantity")
        self.preview_tree.heading("Revenue", text="Revenue")
        
        # Column widths
        self.preview_tree.column("SKU", width=150)
        self.preview_tree.column("MSKU", width=150)
        self.preview_tree.column("Name", width=200)
        self.preview_tree.column("Quantity", width=100)
        self.preview_tree.column("Revenue", width=100)
        
        # Scrollbar
        preview_scrollbar = ttk.Scrollbar(preview_frame, orient=tk.VERTICAL, command=self.preview_tree.yview)
        self.preview_tree.configure(yscrollcommand=preview_scrollbar.set)
        
        self.preview_tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        preview_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Configure weights
        preview_frame.columnconfigure(0, weight=1)
        preview_frame.rowconfigure(0, weight=1)
        
    def create_control_buttons(self, parent):
        """Create control buttons"""
        button_frame = ttk.Frame(parent)
        button_frame.grid(row=4, column=0, columnspan=3, pady=(10, 0))
        
        self.export_btn = ttk.Button(button_frame, text="Export Cleaned Data", 
                                    command=self.export_data, state=tk.DISABLED)
        self.export_btn.grid(row=0, column=0, padx=(0, 10))
        
        self.save_mappings_btn = ttk.Button(button_frame, text="Save Mappings", 
                                           command=self.save_mappings_to_file)
        self.save_mappings_btn.grid(row=0, column=1, padx=(0, 10))
        
        self.load_mappings_btn = ttk.Button(button_frame, text="Load Mappings", 
                                           command=self.load_mappings_from_file)
        self.load_mappings_btn.grid(row=0, column=2, padx=(0, 10))
        
        self.validate_btn = ttk.Button(button_frame, text="Validate Data", 
                                      command=self.validate_data)
        self.validate_btn.grid(row=0, column=3)
        
    def upload_file(self):
        """Upload and load sales data CSV file"""
        file_path = filedialog.askopenfilename(
            title="Select Sales Data CSV",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                self.sales_data = pd.read_csv(file_path)
                self.file_label.config(text=f"Loaded: {os.path.basename(file_path)}")
                self.auto_map_btn.config(state=tk.NORMAL)
                self.export_btn.config(state=tk.NORMAL)
                
                # Extract unique SKUs
                self.extract_unique_skus()
                
                # Update preview
                self.update_preview()
                
                logging.info(f"Successfully loaded sales data from {file_path}")
                messagebox.showinfo("Success", "Sales data loaded successfully!")
                
            except Exception as e:
                logging.error(f"Error loading file: {str(e)}")
                messagebox.showerror("Error", f"Error loading file: {str(e)}")
                
    def extract_unique_skus(self):
        """Extract unique SKUs from the sales data"""
        if self.sales_data is not None:
            # Look for common SKU column names
            sku_columns = [col for col in self.sales_data.columns 
                          if 'sku' in col.lower() or 'product' in col.lower()]
            
            if sku_columns:
                sku_column = sku_columns[0]
                unique_skus = self.sales_data[sku_column].dropna().unique()
                
                # Update SKU listbox
                self.sku_listbox.delete(0, tk.END)
                for sku in sorted(unique_skus):
                    self.sku_listbox.insert(tk.END, sku)
                    
                logging.info(f"Extracted {len(unique_skus)} unique SKUs")
                
    def auto_map_skus(self):
        """Automatically map SKUs to MSKUs using pattern matching"""
        if self.sales_data is None:
            return
            
        # Get all SKUs from listbox
        all_skus = list(self.sku_listbox.get(0, tk.END))
        
        # Simple auto-mapping logic
        for sku in all_skus:
            if sku not in self.mappings:
                # Try to create MSKU from SKU
                msku = self.create_msku_from_sku(sku)
                self.mappings[sku] = {
                    'msku': msku,
                    'marketplace': 'Auto-mapped'
                }
                
        # Update preview
        self.update_preview()
        
        logging.info(f"Auto-mapped {len(all_skus)} SKUs")
        messagebox.showinfo("Auto-Mapping Complete", f"Auto-mapped {len(all_skus)} SKUs")
        
    def create_msku_from_sku(self, sku):
        """Create MSKU from SKU using pattern matching"""
        # Remove common prefixes/suffixes
        cleaned_sku = re.sub(r'^(AMZ|EBAY|SHOP|WC)_', '', sku)
        cleaned_sku = re.sub(r'_[0-9]+$', '', cleaned_sku)
        
        # Convert to uppercase and remove special characters
        msku = re.sub(r'[^A-Z0-9]', '', cleaned_sku.upper())
        
        return msku if msku else f"MSKU_{sku}"
        
    def on_sku_select(self, event):
        """Handle SKU selection"""
        selection = self.sku_listbox.curselection()
        if selection:
            selected_sku = self.sku_listbox.get(selection[0])
            self.sku_var.set(selected_sku)
            
            # Load existing mapping if available
            if selected_sku in self.mappings:
                mapping = self.mappings[selected_sku]
                self.msku_var.set(mapping.get('msku', ''))
                self.marketplace_var.set(mapping.get('marketplace', ''))
            else:
                self.msku_var.set('')
                self.marketplace_var.set('')
                
    def save_mapping(self):
        """Save current SKU mapping"""
        sku = self.sku_var.get()
        msku = self.msku_var.get()
        marketplace = self.marketplace_var.get()
        
        if not sku or not msku:
            messagebox.showwarning("Warning", "Please enter both SKU and MSKU")
            return
            
        self.mappings[sku] = {
            'msku': msku,
            'marketplace': marketplace
        }
        
        logging.info(f"Saved mapping: {sku} -> {msku}")
        messagebox.showinfo("Success", f"Mapping saved: {sku} -> {msku}")
        
        # Update preview
        self.update_preview()
        
    def clear_mapping(self):
        """Clear current mapping form"""
        self.sku_var.set('')
        self.msku_var.set('')
        self.marketplace_var.set('')
        
    def delete_mapping(self):
        """Delete current SKU mapping"""
        sku = self.sku_var.get()
        if sku and sku in self.mappings:
            del self.mappings[sku]
            logging.info(f"Deleted mapping for SKU: {sku}")
            messagebox.showinfo("Success", f"Mapping deleted for SKU: {sku}")
            self.update_preview()
            
    def update_preview(self):
        """Update the data preview"""
        if self.sales_data is None:
            return
            
        # Clear existing items
        for item in self.preview_tree.get_children():
            self.preview_tree.delete(item)
            
        # Find SKU column
        sku_columns = [col for col in self.sales_data.columns 
                      if 'sku' in col.lower() or 'product' in col.lower()]
        
        if not sku_columns:
            return
            
        sku_column = sku_columns[0]
        
        # Add mapped data to preview
        for _, row in self.sales_data.head(50).iterrows():  # Show first 50 rows
            sku = str(row[sku_column]) if pd.notna(row[sku_column]) else ''
            msku = self.mappings.get(sku, {}).get('msku', '') if sku else ''
            
            # Get other relevant columns
            name = str(row.get('product_name', row.get('name', ''))) if 'product_name' in row or 'name' in row else ''
            quantity = str(row.get('quantity', row.get('qty', ''))) if 'quantity' in row or 'qty' in row else ''
            revenue = str(row.get('revenue', row.get('amount', ''))) if 'revenue' in row or 'amount' in row else ''
            
            self.preview_tree.insert('', tk.END, values=(sku, msku, name, quantity, revenue))
            
    def export_data(self):
        """Export cleaned data with mappings"""
        if self.sales_data is None:
            messagebox.showwarning("Warning", "No data to export")
            return
            
        file_path = filedialog.asksaveasfilename(
            title="Save Cleaned Data",
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                # Create cleaned data
                cleaned_data = self.sales_data.copy()
                
                # Find SKU column
                sku_columns = [col for col in cleaned_data.columns 
                              if 'sku' in col.lower() or 'product' in col.lower()]
                
                if sku_columns:
                    sku_column = sku_columns[0]
                    
                    # Add MSKU column
                    cleaned_data['MSKU'] = cleaned_data[sku_column].map(
                        lambda x: self.mappings.get(str(x), {}).get('msku', '') if pd.notna(x) else ''
                    )
                    
                    # Add marketplace column
                    cleaned_data['Marketplace'] = cleaned_data[sku_column].map(
                        lambda x: self.mappings.get(str(x), {}).get('marketplace', '') if pd.notna(x) else ''
                    )
                    
                cleaned_data.to_csv(file_path, index=False)
                
                logging.info(f"Exported cleaned data to {file_path}")
                messagebox.showinfo("Success", f"Data exported to {file_path}")
                
            except Exception as e:
                logging.error(f"Error exporting data: {str(e)}")
                messagebox.showerror("Error", f"Error exporting data: {str(e)}")
                
    def save_mappings_to_file(self):
        """Save mappings to JSON file"""
        file_path = filedialog.asksaveasfilename(
            title="Save Mappings",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w') as f:
                    json.dump(self.mappings, f, indent=2)
                    
                logging.info(f"Saved mappings to {file_path}")
                messagebox.showinfo("Success", f"Mappings saved to {file_path}")
                
            except Exception as e:
                logging.error(f"Error saving mappings: {str(e)}")
                messagebox.showerror("Error", f"Error saving mappings: {str(e)}")
                
    def load_mappings_from_file(self):
        """Load mappings from JSON file"""
        file_path = filedialog.askopenfilename(
            title="Load Mappings",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    self.mappings = json.load(f)
                    
                logging.info(f"Loaded mappings from {file_path}")
                messagebox.showinfo("Success", f"Mappings loaded from {file_path}")
                
                # Update preview
                self.update_preview()
                
            except Exception as e:
                logging.error(f"Error loading mappings: {str(e)}")
                messagebox.showerror("Error", f"Error loading mappings: {str(e)}")
                
    def load_existing_mappings(self):
        """Load existing mappings from default file"""
        default_file = "sku_mappings.json"
        if os.path.exists(default_file):
            try:
                with open(default_file, 'r') as f:
                    self.loaded_mappings = json.load(f)
                logging.info(f"Loaded existing mappings from {default_file}")
            except Exception as e:
                logging.error(f"Error loading existing mappings: {str(e)}")
                
    def validate_data(self):
        """Validate the current data and mappings"""
        if self.sales_data is None:
            messagebox.showwarning("Warning", "No data loaded")
            return
            
        issues = []
        
        # Check for unmapped SKUs
        sku_columns = [col for col in self.sales_data.columns 
                      if 'sku' in col.lower() or 'product' in col.lower()]
        
        if sku_columns:
            sku_column = sku_columns[0]
            unique_skus = self.sales_data[sku_column].dropna().unique()
            unmapped_skus = [sku for sku in unique_skus if str(sku) not in self.mappings]
            
            if unmapped_skus:
                issues.append(f"Unmapped SKUs: {len(unmapped_skus)}")
                
        # Check for duplicate MSKUs
        msku_counts = {}
        for mapping in self.mappings.values():
            msku = mapping.get('msku', '')
            if msku:
                msku_counts[msku] = msku_counts.get(msku, 0) + 1
                
        duplicate_mskus = [msku for msku, count in msku_counts.items() if count > 1]
        if duplicate_mskus:
            issues.append(f"Duplicate MSKUs: {len(duplicate_mskus)}")
            
        if issues:
            message = "Validation Issues Found:\n" + "\n".join(issues)
            messagebox.showwarning("Validation Issues", message)
        else:
            messagebox.showinfo("Validation", "All data is valid!")
            
        logging.info(f"Data validation completed. Issues: {len(issues)}")
        
    def run(self):
        """Start the GUI application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = SKUMapper()
    app.run() 