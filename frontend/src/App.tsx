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
import { EllipsisOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

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

      // Check if the file is already in base64 format
      if (fileList[0].url && fileList[0].url.startsWith('data:image')) {
        base64Image = fileList[0].url; // Use the existing base64 URL
      } else {
        try {
          base64Image = await convertToBase64(file);
        } catch (error) {
          message.error('Failed to process the image');
          return;
        }
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
        <div
          onClick={() => setIsModalVisible(true)}
          style={{ cursor: 'pointer' }}
        >
          <p>What's on your mind?</p>
        </div>
      </Card>

      <List
        itemLayout='vertical'
        size='large'
        dataSource={posts}
        renderItem={(post: any) => {
          const menu = (
            <Menu>
              <Menu.Item key='edit' onClick={() => handleEdit(post)}>
                <EditOutlined /> Edit
              </Menu.Item>
              <Menu.Item
                key='delete'
                danger
                onClick={() => handleDelete(post._id)}
              >
                <DeleteOutlined /> Delete
              </Menu.Item>
            </Menu>
          );

          return (
            <Card
              key={post._id}
              title={post.title}
              extra={
                <Dropdown overlay={menu} trigger={['click']}>
                  <Button type='text' icon={<EllipsisOutlined />} />
                </Dropdown>
              }
              style={{ marginBottom: '20px' }}
            >
              <List.Item.Meta
                description={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ marginRight: '8px' }}
                      />
                      <span>
                        <b>Praveen Pandi</b>
                      </span>
                    </div>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                }
              />
              <p>{post.content}</p>
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
          );
        }}
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
