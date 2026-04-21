from django.urls import path
from .views import SalesDataView, SalesDataDetailView

urlpatterns = [
    path('sales/', SalesDataView.as_view(), name='sales-list'),
    path('sales/<int:vbeln>/<int:posnr>/', SalesDataDetailView.as_view(), name='sales-detail'),
]
