# evaluation/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .task_registry import task_registry
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

'''@api_view(['POST'])
@csrf_exempt
def run_evaluation(request, task_type):
    evaluator = task_registry.get(task_type)
    if not evaluator:
        return Response({"error": f"Unsupported task type: {task_type}"}, status=400)

    try:
        print(request.data)
        results = evaluator(request.data)
        
        return Response({"results": results})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
'''
@csrf_exempt
def upload_model(request):
    print(">>> ENTERED UPLOAD_MODEL VIEW <<<")
    print("Method:", request.method)
    print("POST keys:", request.POST.keys())
    print("FILES keys:", request.FILES.keys())

    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    filename = file.name
    ext = os.path.splitext(filename)[1]
    if ext not in ['.h5', '.pt']:
        return JsonResponse({'error': 'Invalid file type'}, status=400)

    user = request.POST.get('username', 'Anonymous')
    model_dir = os.path.join(settings.MEDIA_ROOT, 'models', user)
    os.makedirs(model_dir, exist_ok=True)

    save_path = os.path.join(model_dir, filename)
    with open(save_path, 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    return JsonResponse({'message': 'Upload successful'})

@csrf_exempt
@api_view(['POST'])
def upload_test_file(request):
    file = request.FILES.get('file')
    room_id = request.POST.get('roomId')

    if not file or not room_id:
        return JsonResponse({'error': 'Missing file or room ID'}, status=400)

    # 创建保存目录：media/test_sets/<room_id>/
    test_dir = os.path.join(settings.MEDIA_ROOT, 'test_sets', room_id)
    os.makedirs(test_dir, exist_ok=True)

    # 保存文件
    save_path = os.path.join(test_dir, file.name)
    with open(save_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    return JsonResponse({
        'message': f'Test file "{file.name}" uploaded successfully',
        'path': save_path,
        'roomId': room_id,
    })
