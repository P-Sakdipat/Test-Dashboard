import pandas as pd
import sys

try:
    df = pd.read_excel('zsdr003_datadic.xlsx', nrows=5)
    print("Columns:")
    print(df.columns.tolist())
    print("\nData Types:")
    print(df.dtypes)
    print("\nSample Data:")
    print(df.head())
except Exception as e:
    print(f"Error reading excel: {e}")
