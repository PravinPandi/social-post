import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
} from './redux/actions/post.action';
import {
  Card,
  Button,
  Input,
  Form,
  Modal,
  Avatar,
  List,
  Space,
  message,
  Upload,
  Image,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { TextArea } = Input;

const SocialMediaPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts } = useSelector((state: RootState) => state.posts);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleUploadChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPost(null);
    form.resetFields();
    setFileList([]);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onFinish = async (values: { title: string; content: string }) => {
    let base64Image: string | undefined;

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj as File;
      try {
        base64Image = await convertToBase64(file);
      } catch (error) {
        message.error('Failed to process the image');
        return;
      }
    }

    if (editingPost) {
      dispatch(
        updatePost({
          id: editingPost._id,
          postData: { ...values, image: base64Image },
        })
      );
      message.success('Post updated successfully');
    } else {
      dispatch(createPost({ ...values, image: base64Image }));
      message.success('Post created successfully');
    }

    handleCancel();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    form.setFieldsValue({
      title: post.title,
      content: post.content,
    });
    if (post.image) {
      setFileList([
        {
          uid: '-1',
          name: 'post-image',
          status: 'done',
          url: post.image,
        },
      ]);
    }
    setIsModalVisible(true);
  };

  const handleDelete = (postId: string) => {
    dispatch(deletePost(postId));
    message.success('Post deleted successfully');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Card
        title='Create Post'
        style={{ marginBottom: '20px' }}
        extra={
          <Button type='primary' onClick={() => setIsModalVisible(true)}>
            Create Post
          </Button>
        }
      >
        <p>What's on your mind?</p>
      </Card>

      <List
        itemLayout='vertical'
        size='large'
        dataSource={posts}
        renderItem={(post: any) => (
          <Card
            key={post._id}
            title={post.title}
            extra={
              <Space>
                <Button
                  type='text'
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(post)}
                >
                  Edit
                </Button>
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(post._id)}
                >
                  Delete
                </Button>
              </Space>
            }
            style={{ marginBottom: '20px' }}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              description={new Date(post.createdAt).toLocaleString()}
            />
            {post.image && (
              <div style={{ margin: '10px 0' }}>
                <Image
                  width='100%'
                  src={post.image}
                  alt='Post image'
                  style={{ borderRadius: '8px' }}
                />
              </div>
            )}
            <p>{post.content}</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '10px',
              }}
            >
              <Space>
                <LikeOutlined /> Like
              </Space>
              <Space>
                <CommentOutlined /> Comment
              </Space>
              <Space>
                <ShareAltOutlined /> Share
              </Space>
            </div>
          </Card>
        )}
      />

      <Modal
        title={editingPost ? 'Edit Post' : 'Create Post'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout='vertical' onFinish={onFinish}>
          <Form.Item
            name='title'
            label='Title'
            rules={[{ required: true, message: 'Please input a title!' }]}
          >
            <Input placeholder='Post title' />
          </Form.Item>
          <Form.Item
            name='content'
            label='Content'
            rules={[{ required: true, message: 'Please input content!' }]}
          >
            <TextArea rows={4} placeholder="What's on your mind?" />
          </Form.Item>
          <Form.Item label='Image'>
            <Upload
              listType='picture-card'
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={1}
              accept='image/*'
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SocialMediaPage;
