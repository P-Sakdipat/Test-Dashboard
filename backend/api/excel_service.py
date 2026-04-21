import pandas as pd
import numpy as np
import threading
import os
from django.conf import settings

# A lock to prevent concurrent modifications to the Excel file
excel_lock = threading.Lock()

EXCEL_FILE_PATH = os.path.join(settings.BASE_DIR.parent, 'zsdr003_datadic.xlsx')

def get_dashboard_data():
    """Reads the Excel file and returns the important columns as a list of dictionaries."""
    with excel_lock:
        if not os.path.exists(EXCEL_FILE_PATH):
            return []
        
        # We read the essential columns
        cols = ['dlDate', 'FKDAT', 'VBELN', 'POSNR', 'MATNR', 'ARKTX', 'Quantity', 'NetValue', 'SoldToName1', 'EmpName']
        df = pd.read_excel(EXCEL_FILE_PATH, usecols=lambda c: c in cols)
        
        # Replace NaN with None so it serializes correctly to JSON
        df = df.replace({np.nan: None})
        
        return df.to_dict('records')

def add_row(data):
    """Appends a new row to the end of the Excel file."""
    with excel_lock:
        df = pd.read_excel(EXCEL_FILE_PATH)
        
        # Create a new dataframe with one row
        new_row = pd.DataFrame([data])
        
        # Concatenate and save
        df = pd.concat([df, new_row], ignore_index=True)
        df.to_excel(EXCEL_FILE_PATH, index=False)

def update_row(vbeln, posnr, data):
    """Updates a row identified by VBELN and POSNR."""
    with excel_lock:
        df = pd.read_excel(EXCEL_FILE_PATH)
        
        # Find index
        mask = (df['VBELN'] == vbeln) & (df['POSNR'] == posnr)
        
        if not mask.any():
            return False
            
        # Update the row. Only update provided keys
        idx = df.index[mask].tolist()[0]
        for key, value in data.items():
            if key in df.columns:
                df.at[idx, key] = value
                
        df.to_excel(EXCEL_FILE_PATH, index=False)
        return True

def delete_row(vbeln, posnr):
    """Deletes a row identified by VBELN and POSNR."""
    with excel_lock:
        df = pd.read_excel(EXCEL_FILE_PATH)
        
        # Find index
        mask = (df['VBELN'] == vbeln) & (df['POSNR'] == posnr)
        
        if not mask.any():
            return False
            
        df = df[~mask]
        df.to_excel(EXCEL_FILE_PATH, index=False)
        return True
