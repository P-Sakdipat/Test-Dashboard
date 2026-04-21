from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import excel_service

class SalesDataView(APIView):
    def get(self, request):
        try:
            data = excel_service.get_dashboard_data()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            excel_service.add_row(request.data)
            return Response({"message": "Row added successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SalesDataDetailView(APIView):
    def put(self, request, vbeln, posnr):
        try:
            success = excel_service.update_row(vbeln, posnr, request.data)
            if success:
                return Response({"message": "Row updated successfully"}, status=status.HTTP_200_OK)
            return Response({"error": "Row not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, vbeln, posnr):
        try:
            success = excel_service.delete_row(vbeln, posnr)
            if success:
                return Response({"message": "Row deleted successfully"}, status=status.HTTP_200_OK)
            return Response({"error": "Row not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
