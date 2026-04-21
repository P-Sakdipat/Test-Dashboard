import pandas as pd

df = pd.read_excel('zsdr003_datadic.xlsx', usecols=['VBELN', 'POSNR'])
is_unique = not df.duplicated(subset=['VBELN', 'POSNR']).any()
print(f"Is VBELN + POSNR unique? {is_unique}")
print(df.head())
